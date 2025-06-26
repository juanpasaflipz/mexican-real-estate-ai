const unifiedSearchService = require('./unifiedSearchService');
const logger = require('../utils/logger');

/**
 * Enhanced NLP Service using Pinecone Vector Search
 * This replaces SQL generation with semantic vector search
 */
class NLPServiceV2 {
  /**
   * Process natural language query using vector search
   */
  async processQuery(query, options = {}) {
    try {
      logger.info(`Processing NLP query: "${query}"`);

      // Use unified search service which combines vector search + filters
      const searchResults = await unifiedSearchService.naturalLanguageSearch(query, {
        limit: options.limit || 20,
        includeAnalysis: true
      });

      // Format response to match existing API structure
      return {
        success: true,
        interpretation: {
          originalQuery: query,
          searchType: 'vector_semantic',
          confidence: 'high',
          extractedFilters: searchResults.filters
        },
        results: searchResults.properties,
        metadata: {
          totalResults: searchResults.total,
          totalMatches: searchResults.totalMatches,
          searchMethod: 'pinecone_vector'
        },
        analysis: searchResults.analysis || this.generateBasicAnalysis(searchResults),
        execution: {
          duration: Date.now() - (options.startTime || Date.now()),
          method: 'vector_search'
        }
      };

    } catch (error) {
      logger.error('NLP processing error:', error);
      throw error;
    }
  }

  /**
   * Generate basic analysis if AI analysis fails
   */
  generateBasicAnalysis(searchResults) {
    if (searchResults.properties.length === 0) {
      return 'No se encontraron propiedades que coincidan con tu búsqueda. Intenta con términos más generales o ajusta tus filtros.';
    }

    const avgPrice = searchResults.properties.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / searchResults.properties.length;
    const cities = [...new Set(searchResults.properties.map(p => p.city))];
    
    return `Encontré ${searchResults.total} propiedades. Precio promedio: $${avgPrice.toLocaleString('es-MX')} MXN. Ubicaciones: ${cities.slice(0, 3).join(', ')}${cities.length > 3 ? ' y más' : ''}.`;
  }

  /**
   * Get search suggestions based on query
   */
  async getSuggestions(query) {
    const baseQuery = query.toLowerCase();
    const suggestions = [];

    // Location-based suggestions
    if (!baseQuery.includes('en ')) {
      suggestions.push(`${query} en Cancún`, `${query} en CDMX`, `${query} en Playa del Carmen`);
    }

    // Price-based suggestions
    if (!baseQuery.match(/\d/)) {
      suggestions.push(`${query} bajo 5 millones`, `${query} entre 2 y 4 millones`);
    }

    // Feature-based suggestions
    if (!baseQuery.includes('con ')) {
      suggestions.push(`${query} con alberca`, `${query} con jardín`, `${query} con estacionamiento`);
    }

    return suggestions.slice(0, 5);
  }

  /**
   * Backward compatibility: translate query to SQL (delegates to vector search)
   */
  async translateToSQL(query, schema) {
    logger.warn('translateToSQL called - redirecting to vector search');
    
    // Return a mock SQL response for compatibility
    return {
      query,
      sql: `-- Vector search performed for: "${query}"`,
      interpretation: 'This query now uses semantic vector search instead of SQL',
      method: 'vector_search'
    };
  }
}

module.exports = new NLPServiceV2();