const express = require('express');
const router = express.Router();
const pineconeService = require('../services/pineconeService');
const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * Vector search endpoint
 * POST /api/vector-search
 */
router.post('/search', async (req, res) => {
  try {
    const { query, filters = {}, limit = 20 } = req.body;

    if (!query) {
      return res.status(400).json({ 
        error: 'Search query is required' 
      });
    }

    // Perform vector search
    const vectorResults = await pineconeService.searchProperties(
      query,
      filters,
      limit
    );

    // Get full property details from database
    if (vectorResults.length > 0) {
      const propertyIds = vectorResults.map(r => r.property_id);
      const placeholders = propertyIds.map((_, i) => `$${i + 1}`).join(',');
      
      const dbQuery = `
        SELECT p.*, 
               COALESCE(
                 json_agg(
                   DISTINCT jsonb_build_object(
                     'id', pi.id,
                     'url', pi.image_url,
                     'caption', pi.caption,
                     'order', pi.display_order
                   )
                 ) FILTER (WHERE pi.id IS NOT NULL), 
                 '[]'
               ) as images
        FROM properties p
        LEFT JOIN property_images pi ON p.id = pi.property_id
        WHERE p.id IN (${placeholders})
        GROUP BY p.id
      `;

      const result = await pool.query(dbQuery, propertyIds);
      
      // Merge vector scores with property data
      const propertiesWithScores = result.rows.map(property => {
        const vectorMatch = vectorResults.find(
          v => v.property_id === property.id
        );
        return {
          ...property,
          relevance_score: vectorMatch?.score || 0
        };
      });

      // Sort by relevance score
      propertiesWithScores.sort((a, b) => b.relevance_score - a.relevance_score);

      res.json({
        success: true,
        query,
        filters,
        total: propertiesWithScores.length,
        properties: propertiesWithScores,
        message: `Found ${propertiesWithScores.length} properties matching your search`
      });
    } else {
      res.json({
        success: true,
        query,
        filters,
        total: 0,
        properties: [],
        message: 'No properties found matching your search'
      });
    }
  } catch (error) {
    logger.error('Vector search error:', error);
    res.status(500).json({ 
      error: 'Failed to perform vector search',
      details: error.message 
    });
  }
});

/**
 * Semantic search with natural language
 * POST /api/vector-search/semantic
 */
router.post('/semantic', async (req, res) => {
  try {
    const { query, limit = 20 } = req.body;

    if (!query) {
      return res.status(400).json({ 
        error: 'Search query is required' 
      });
    }

    // Extract filters from natural language query
    const filters = extractFiltersFromQuery(query);

    // Perform vector search
    const vectorResults = await pineconeService.searchProperties(
      query,
      filters,
      limit
    );

    // Get full property details
    if (vectorResults.length > 0) {
      const propertyIds = vectorResults.map(r => r.property_id);
      const placeholders = propertyIds.map((_, i) => `$${i + 1}`).join(',');
      
      const dbQuery = `
        SELECT p.*, 
               COALESCE(
                 json_agg(
                   DISTINCT jsonb_build_object(
                     'id', pi.id,
                     'url', pi.image_url,
                     'caption', pi.caption,
                     'order', pi.display_order
                   )
                 ) FILTER (WHERE pi.id IS NOT NULL), 
                 '[]'
               ) as images
        FROM properties p
        LEFT JOIN property_images pi ON p.id = pi.property_id
        WHERE p.id IN (${placeholders})
        GROUP BY p.id
      `;

      const result = await pool.query(dbQuery, propertyIds);
      
      // Merge and sort by relevance
      const properties = result.rows.map(property => {
        const vectorMatch = vectorResults.find(
          v => v.property_id === property.id
        );
        return {
          ...property,
          relevance_score: vectorMatch?.score || 0,
          match_reason: generateMatchReason(property, query)
        };
      }).sort((a, b) => b.relevance_score - a.relevance_score);

      res.json({
        success: true,
        query,
        interpreted_filters: filters,
        total: properties.length,
        properties,
        search_insights: generateSearchInsights(properties, query)
      });
    } else {
      res.json({
        success: true,
        query,
        interpreted_filters: filters,
        total: 0,
        properties: [],
        search_insights: {
          message: 'No properties found. Try broadening your search or using different terms.',
          suggestions: generateSearchSuggestions(query)
        }
      });
    }
  } catch (error) {
    logger.error('Semantic search error:', error);
    res.status(500).json({ 
      error: 'Failed to perform semantic search',
      details: error.message 
    });
  }
});

/**
 * Get vector index statistics
 * GET /api/vector-search/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await pineconeService.getIndexStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Error getting vector stats:', error);
    res.status(500).json({ 
      error: 'Failed to get vector index statistics' 
    });
  }
});

/**
 * Helper function to extract filters from natural language query
 */
function extractFiltersFromQuery(query) {
  const filters = {};
  const lowerQuery = query.toLowerCase();

  // Extract price ranges
  const priceMatch = lowerQuery.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:million|millones|mil|k|m)/i);
  if (priceMatch) {
    const priceStr = priceMatch[1].replace(/,/g, '');
    let price = parseFloat(priceStr);
    
    if (lowerQuery.includes('million') || lowerQuery.includes('millones')) {
      price *= 1000000;
    } else if (lowerQuery.includes('mil') || lowerQuery.includes('k')) {
      price *= 1000;
    }
    
    if (lowerQuery.includes('under') || lowerQuery.includes('menos de') || lowerQuery.includes('bajo')) {
      filters.max_price = price;
    } else if (lowerQuery.includes('over') || lowerQuery.includes('más de') || lowerQuery.includes('sobre')) {
      filters.min_price = price;
    }
  }

  // Extract bedroom count
  const bedroomMatch = lowerQuery.match(/(\d+)\s*(?:bedroom|bedrooms|recámara|recámaras|habitacion|habitaciones)/i);
  if (bedroomMatch) {
    filters.bedrooms = parseInt(bedroomMatch[1]);
  }

  // Extract bathroom count
  const bathroomMatch = lowerQuery.match(/(\d+)\s*(?:bathroom|bathrooms|baño|baños)/i);
  if (bathroomMatch) {
    filters.bathrooms = parseInt(bathroomMatch[1]);
  }

  // Extract property types
  const propertyTypes = {
    'house': ['casa', 'house', 'home'],
    'apartment': ['departamento', 'apartment', 'depa', 'flat'],
    'condo': ['condominio', 'condo'],
    'land': ['terreno', 'land', 'lot'],
    'commercial': ['comercial', 'commercial', 'local']
  };

  for (const [type, keywords] of Object.entries(propertyTypes)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      filters.property_type = type;
      break;
    }
  }

  return filters;
}

/**
 * Generate match reason for a property
 */
function generateMatchReason(property, query) {
  const reasons = [];
  const lowerQuery = query.toLowerCase();

  if (property.city && lowerQuery.includes(property.city.toLowerCase())) {
    reasons.push(`Located in ${property.city}`);
  }

  if (property.colonia && lowerQuery.includes(property.colonia.toLowerCase())) {
    reasons.push(`In ${property.colonia} neighborhood`);
  }

  if (property.property_type) {
    reasons.push(`${property.property_type} property`);
  }

  if (reasons.length === 0) {
    reasons.push('Matches your search criteria');
  }

  return reasons.join(' • ');
}

/**
 * Generate search insights
 */
function generateSearchInsights(properties, query) {
  if (properties.length === 0) {
    return {
      message: 'No properties found matching your criteria'
    };
  }

  const avgPrice = properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length;
  const cities = [...new Set(properties.map(p => p.city).filter(Boolean))];
  const propertyTypes = [...new Set(properties.map(p => p.property_type).filter(Boolean))];

  return {
    message: `Found ${properties.length} properties matching "${query}"`,
    average_price: Math.round(avgPrice),
    price_range: {
      min: Math.min(...properties.map(p => p.price || 0)),
      max: Math.max(...properties.map(p => p.price || 0))
    },
    cities: cities.slice(0, 5),
    property_types: propertyTypes,
    top_match_score: properties[0]?.relevance_score || 0
  };
}

/**
 * Generate search suggestions
 */
function generateSearchSuggestions(query) {
  return [
    'Try searching for a specific city or neighborhood',
    'Include property type (casa, departamento, terreno)',
    'Specify number of bedrooms or bathrooms',
    'Add price range (e.g., "under 5 million pesos")',
    'Use more descriptive terms about desired features'
  ];
}

module.exports = router;