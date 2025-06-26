const pineconeService = require('./pineconeService');
const pool = require('../config/database');
const logger = require('../utils/logger');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Unified search service that combines Pinecone vector search with database queries
 */
class UnifiedSearchService {
  /**
   * Perform a natural language search using vector similarity
   */
  async naturalLanguageSearch(query, options = {}) {
    const { 
      limit = 20, 
      includeAnalysis = true,
      filters = {} 
    } = options;

    try {
      logger.info(`Natural language search: "${query}"`);

      // Extract filters from the natural language query
      const extractedFilters = this.extractFiltersFromQuery(query);
      const combinedFilters = { ...extractedFilters, ...filters };

      // Perform vector search
      const vectorResults = await pineconeService.searchProperties(
        query,
        combinedFilters,
        limit * 2 // Get more results for better filtering
      );

      if (vectorResults.length === 0) {
        return {
          success: true,
          query,
          filters: combinedFilters,
          properties: [],
          total: 0,
          message: 'No properties found matching your search criteria.',
          suggestions: this.generateSearchSuggestions(query)
        };
      }

      // Get full property details from database
      const propertyIds = vectorResults.map(r => r.property_id);
      const properties = await this.getPropertiesById(propertyIds);

      // Merge with vector scores and sort by relevance
      const enhancedProperties = properties.map(property => {
        const vectorMatch = vectorResults.find(v => v.property_id === property.id);
        return {
          ...property,
          relevance_score: vectorMatch?.score || 0
        };
      }).sort((a, b) => b.relevance_score - a.relevance_score);

      // Limit to requested count
      const finalProperties = enhancedProperties.slice(0, limit);

      // Generate AI analysis if requested
      let analysis = null;
      if (includeAnalysis) {
        analysis = await this.generateSearchAnalysis(query, finalProperties);
      }

      return {
        success: true,
        query,
        filters: combinedFilters,
        properties: finalProperties,
        total: finalProperties.length,
        totalMatches: enhancedProperties.length,
        analysis,
        message: `Found ${finalProperties.length} properties matching "${query}"`
      };

    } catch (error) {
      logger.error('Natural language search error:', error);
      throw error;
    }
  }

  /**
   * Extract filters from natural language query
   */
  extractFiltersFromQuery(query) {
    const filters = {};
    const lowerQuery = query.toLowerCase();

    // Price extraction
    const pricePatterns = [
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:million|millones|mdp|m)/i,
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:mil|thousand|k)/i,
      /\$?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:pesos|mxn|peso)?/i
    ];

    for (const pattern of pricePatterns) {
      const match = lowerQuery.match(pattern);
      if (match) {
        let price = parseFloat(match[1].replace(/,/g, ''));
        
        if (pattern.toString().includes('million')) {
          price *= 1000000;
        } else if (pattern.toString().includes('mil|thousand|k')) {
          price *= 1000;
        }

        if (lowerQuery.includes('under') || lowerQuery.includes('menos de') || 
            lowerQuery.includes('máximo') || lowerQuery.includes('hasta')) {
          filters.max_price = price;
        } else if (lowerQuery.includes('over') || lowerQuery.includes('más de') || 
                   lowerQuery.includes('mínimo') || lowerQuery.includes('desde')) {
          filters.min_price = price;
        } else if (lowerQuery.includes('around') || lowerQuery.includes('cerca de') || 
                   lowerQuery.includes('aproximadamente')) {
          filters.min_price = price * 0.8;
          filters.max_price = price * 1.2;
        }
        break;
      }
    }

    // Bedroom/bathroom extraction
    const roomPatterns = [
      { pattern: /(\d+)\s*(?:bedroom|bedrooms|recámara|recámaras|habitacion|habitaciones)/i, field: 'bedrooms' },
      { pattern: /(\d+)\s*(?:bathroom|bathrooms|baño|baños)/i, field: 'bathrooms' }
    ];

    roomPatterns.forEach(({ pattern, field }) => {
      const match = lowerQuery.match(pattern);
      if (match) {
        filters[field] = parseInt(match[1]);
      }
    });

    // Property type extraction - match database values
    const propertyTypes = {
      'Casa': ['casa', 'house', 'home', 'residencia'],
      'Departamento': ['departamento', 'apartment', 'depa', 'flat', 'piso'],
      'Condominio': ['condominio', 'condo'],
      'Terreno': ['terreno', 'land', 'lot', 'lote'],
      'Comercial': ['comercial', 'commercial'],
      'Local': ['local', 'shop', 'tienda'],
      'Oficina': ['oficina', 'office'],
      'Bodega': ['bodega', 'warehouse', 'nave industrial']
    };

    for (const [type, keywords] of Object.entries(propertyTypes)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        filters.property_type = type;
        break;
      }
    }

    // Location extraction (cities/states)
    const majorCities = [
      'cdmx', 'ciudad de méxico', 'mexico city', 'df',
      'guadalajara', 'monterrey', 'puebla', 'cancún', 'cancun',
      'playa del carmen', 'tulum', 'mérida', 'merida',
      'querétaro', 'queretaro', 'san miguel de allende'
    ];

    for (const city of majorCities) {
      if (lowerQuery.includes(city)) {
        if (city === 'cdmx' || city === 'ciudad de méxico' || city === 'mexico city' || city === 'df') {
          filters.cdmx = true;
        } else {
          filters.city = city.charAt(0).toUpperCase() + city.slice(1);
        }
        break;
      }
    }

    return filters;
  }

  /**
   * Get properties by IDs with all details
   */
  async getPropertiesById(propertyIds) {
    if (propertyIds.length === 0) return [];

    const placeholders = propertyIds.map((_, i) => `$${i + 1}`).join(',');
    
    const query = `
      SELECT 
        p.*,
        COALESCE(
          p.images,
          CASE 
            WHEN p.image_url IS NOT NULL THEN 
              jsonb_build_array(
                jsonb_build_object('url', p.image_url)
              )
            ELSE '[]'::jsonb
          END
        ) as images
      FROM properties p
      WHERE p.id IN (${placeholders})
    `;

    const result = await pool.query(query, propertyIds);
    return result.rows;
  }

  /**
   * Generate AI analysis of search results
   */
  async generateSearchAnalysis(query, properties) {
    if (properties.length === 0) return null;

    try {
      const prompt = `
        Analyze these Mexican real estate search results for the query: "${query}"
        
        Properties found: ${properties.length}
        
        Price range: ${this.formatPrice(Math.min(...properties.map(p => parseFloat(p.price) || 0)))} - ${this.formatPrice(Math.max(...properties.map(p => parseFloat(p.price) || 0)))}
        
        Locations: ${[...new Set(properties.map(p => `${p.city}, ${p.state}`))].join('; ')}
        
        Property types: ${[...new Set(properties.map(p => p.property_type))].join(', ')}
        
        Provide a brief, helpful analysis in 2-3 sentences about:
        1. What the results show
        2. Price insights
        3. Location patterns
        4. Any recommendations
        
        Respond in the same language as the query. Be concise and helpful.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Error generating analysis:', error);
      return null;
    }
  }

  /**
   * Format price for display
   */
  formatPrice(price) {
    if (!price) return '$0';
    return `$${price.toLocaleString('es-MX')} MXN`;
  }

  /**
   * Generate search suggestions
   */
  generateSearchSuggestions(query) {
    const suggestions = [
      'Try searching for a specific city (e.g., "casas en Cancún")',
      'Add property type (casa, departamento, terreno)',
      'Include budget range (e.g., "under 5 million pesos")',
      'Specify features (alberca, jardín, garage)',
      'Add number of bedrooms or bathrooms'
    ];

    // Add context-specific suggestions
    if (!query.match(/\d/)) {
      suggestions.unshift('Include specific numbers (e.g., "3 recámaras")');
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Legacy SQL search (fallback)
   */
  async sqlSearch(filters, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Build SQL query based on filters
    if (filters.city) {
      params.push(filters.city);
      query += ` AND city ILIKE $${++paramCount}`;
    }

    if (filters.state) {
      params.push(filters.state);
      query += ` AND state ILIKE $${++paramCount}`;
    }

    if (filters.property_type) {
      params.push(filters.property_type);
      query += ` AND property_type ILIKE $${++paramCount}`;
    }

    if (filters.min_price) {
      params.push(filters.min_price);
      query += ` AND CAST(price AS NUMERIC) >= $${++paramCount}`;
    }

    if (filters.max_price) {
      params.push(filters.max_price);
      query += ` AND CAST(price AS NUMERIC) <= $${++paramCount}`;
    }

    if (filters.bedrooms) {
      params.push(filters.bedrooms);
      query += ` AND bedrooms >= $${++paramCount}`;
    }

    if (filters.bathrooms) {
      params.push(filters.bathrooms);
      query += ` AND bathrooms >= $${++paramCount}`;
    }

    // Add CDMX special handling
    if (filters.cdmx) {
      const cdmxAlcaldias = [
        'Cuauhtémoc', 'Miguel Hidalgo', 'Benito Juárez', 'Álvaro Obregón',
        'Coyoacán', 'Tlalpan', 'Xochimilco', 'Azcapotzalco', 'Gustavo A. Madero',
        'Iztapalapa', 'Iztacalco', 'Magdalena Contreras', 'Tláhuac', 'Venustiano Carranza',
        'Cuajimalpa', 'Milpa Alta'
      ];
      const placeholders = cdmxAlcaldias.map((_, i) => `$${paramCount + i + 1}`).join(',');
      query += ` AND city IN (${placeholders})`;
      params.push(...cdmxAlcaldias);
      paramCount += cdmxAlcaldias.length;
    }

    // Add ordering and pagination
    query += ' ORDER BY created_at DESC';
    params.push(limit, offset);
    query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;

    const result = await pool.query(query, params);
    return result.rows;
  }
}

module.exports = new UnifiedSearchService();