const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all properties with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 24,
      city,
      state,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      propertyType,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build dynamic WHERE clause
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (city) {
      // Special handling for Ciudad de México - search all CDMX alcaldías
      if (city.toLowerCase() === 'ciudad de méxico' || city.toLowerCase() === 'cdmx') {
        const cdmxAlcaldias = [
          'Cuauhtémoc', 'Miguel Hidalgo', 'Benito Juárez', 'Coyoacán', 
          'Tlalpan', 'Xochimilco', 'Azcapotzalco', 'Iztapalapa', 
          'Gustavo A. Madero', 'Álvaro Obregón', 'Venustiano Carranza',
          'Iztacalco', 'Tláhuac', 'Magdalena Contreras', 'Cuajimalpa',
          'Milpa Alta'
        ];
        const placeholders = cdmxAlcaldias.map((_, index) => `$${paramCount + index}`).join(',');
        conditions.push(`city IN (${placeholders})`);
        params.push(...cdmxAlcaldias);
        paramCount += cdmxAlcaldias.length;
      } else {
        conditions.push(`LOWER(city) = LOWER($${paramCount})`);
        params.push(city);
        paramCount++;
      }
    }

    if (state) {
      conditions.push(`LOWER(state) = LOWER($${paramCount})`);
      params.push(state);
      paramCount++;
    }

    if (minPrice) {
      conditions.push(`price >= $${paramCount}`);
      params.push(minPrice);
      paramCount++;
    }

    if (maxPrice) {
      conditions.push(`price <= $${paramCount}`);
      params.push(maxPrice);
      paramCount++;
    }

    if (bedrooms) {
      conditions.push(`bedrooms >= $${paramCount}`);
      params.push(bedrooms);
      paramCount++;
    }

    if (bathrooms) {
      conditions.push(`bathrooms >= $${paramCount}`);
      params.push(bathrooms);
      paramCount++;
    }

    if (propertyType) {
      conditions.push(`property_type = $${paramCount}`);
      params.push(propertyType);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM properties ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get properties with limit and offset
    params.push(limit, offset);
    const query = `
      SELECT 
        id,
        title,
        description,
        price,
        bedrooms,
        bathrooms,
        area_sqm,
        property_type,
        address,
        city,
        state,
        neighborhood,
        features,
        images,
        created_at,
        updated_at,
        CASE 
          WHEN image_url IS NOT NULL AND image_url NOT LIKE 'data:image%' AND image_url != ''
          THEN image_url
          WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
          THEN images->0->>'url'
          ELSE NULL
        END as primary_image
      FROM properties 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        properties: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasMore: offset + result.rows.length < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties'
    });
  }
});

// Get properties with coordinates
router.get('/with-coordinates', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    
    const query = `
      SELECT 
        id, 
        title, 
        address, 
        city, 
        state, 
        neighborhood,
        lat,
        lng,
        price,
        bedrooms,
        bathrooms,
        area_sqm,
        property_type
      FROM properties
      WHERE lat IS NOT NULL 
      AND lng IS NOT NULL
      ORDER BY updated_at DESC, id DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    res.json({
      success: true,
      count: result.rows.length,
      properties: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching properties with coordinates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties',
      message: error.message
    });
  }
});

// Get single property by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.*,
        CASE 
          WHEN p.images IS NOT NULL AND jsonb_array_length(p.images) > 0 
          THEN p.images
          ELSE '[]'::jsonb
        END as images,
        COUNT(DISTINCT pv.id) as view_count
      FROM properties p
      LEFT JOIN property_views pv ON p.id = pv.property_id
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    // Log property view (non-blocking)
    pool.query(
      'INSERT INTO property_views (property_id, viewed_at) VALUES ($1, NOW())',
      [id]
    ).catch(err => console.error('Error logging property view:', err));

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property'
    });
  }
});

// Get similar properties
router.get('/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 6 } = req.query;

    // First get the property details
    const propertyResult = await pool.query(
      'SELECT city, state, price, bedrooms, property_type FROM properties WHERE id = $1',
      [id]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    const property = propertyResult.rows[0];
    
    // Find similar properties based on location and characteristics
    // Handle null values gracefully
    const conditions = ['id != $1'];
    const params = [id];
    let paramCount = 2;

    if (property.city) {
      conditions.push(`city = $${paramCount}`);
      params.push(property.city);
      paramCount++;
    }

    if (property.property_type) {
      conditions.push(`property_type = $${paramCount}`);
      params.push(property.property_type);
      paramCount++;
    }

    if (property.bedrooms) {
      conditions.push(`bedrooms BETWEEN $${paramCount} - 1 AND $${paramCount} + 1`);
      params.push(property.bedrooms);
      paramCount++;
    }

    // Add limit
    params.push(limit);

    const query = `
      SELECT 
        id,
        title,
        price,
        bedrooms,
        bathrooms,
        area_sqm,
        property_type,
        city,
        state,
        CASE 
          WHEN image_url IS NOT NULL AND image_url NOT LIKE 'data:image%' AND image_url != ''
          THEN image_url
          WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
          THEN images->0->>'url'
          ELSE NULL
        END as primary_image
        ${property.price ? `, ABS(price - ${property.price}) as price_difference` : ''}
      FROM properties
      WHERE ${conditions.join(' AND ')}
        ${property.price ? '' : 'AND price IS NOT NULL'}
      ORDER BY ${property.price ? 'price_difference' : 'created_at DESC'}
      LIMIT $${paramCount}
    `;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching similar properties:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch similar properties'
    });
  }
});

// Get featured properties
router.get('/featured/listings', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const query = `
      SELECT 
        id,
        title,
        price,
        bedrooms,
        bathrooms,
        area_sqm,
        property_type,
        city,
        state,
        CASE 
          WHEN image_url IS NOT NULL AND image_url NOT LIKE 'data:image%' AND image_url != ''
          THEN image_url
          WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
          THEN images->0->>'url'
          ELSE NULL
        END as primary_image
      FROM properties
      WHERE price IS NOT NULL
      ORDER BY created_at DESC, view_count DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching featured properties:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured properties'
    });
  }
});

// Search properties using AI (leverages vector search)
router.post('/search', async (req, res) => {
  try {
    const { query, useVectorSearch = true, limit = 20 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // Use the new unified search service
    const unifiedSearchService = require('../services/unifiedSearchService');
    const result = await unifiedSearchService.naturalLanguageSearch(query, {
      limit,
      includeAnalysis: true
    });

    res.json({
      success: true,
      data: result.properties,
      metadata: {
        total: result.total,
        query: result.query,
        filters: result.filters,
        analysis: result.analysis
      }
    });

  } catch (error) {
    console.error('Error in AI property search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process search query'
    });
  }
});

module.exports = router;