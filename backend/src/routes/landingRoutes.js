const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');
const landingCache = require('../services/landingCacheService');

/**
 * Get latest residential properties for landing page
 * Prioritizes Mexico City but includes other major markets
 */
router.get('/latest-listings', async (req, res) => {
  try {
    // Get 70% from Mexico City, 30% from other major markets
    const cdmxAlcaldias = [
      'Cuauhtémoc', 'Miguel Hidalgo', 'Benito Juárez', 'Álvaro Obregón',
      'Coyoacán', 'Tlalpan', 'Xochimilco', 'Azcapotzalco'
    ];
    
    const majorMarkets = [
      'Guadalajara', 'Monterrey', 'Puebla', 'Cancún', 
      'Playa del Carmen', 'Querétaro', 'San Miguel de Allende'
    ];

    // Query for CDMX properties (8 properties)
    const cdmxQuery = `
      SELECT 
        id, title, price, bedrooms, bathrooms, area_sqm,
        property_type, city, state, neighborhood,
        CASE 
          WHEN image_url IS NOT NULL AND image_url NOT LIKE 'data:image%' 
          THEN image_url
          WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
          THEN images->0->>'url'
          ELSE NULL
        END as primary_image,
        created_at,
        'sale' as listing_type
      FROM properties 
      WHERE city = ANY($1::text[])
        AND property_type IN ('Casa', 'Departamento', 'Condominio')
        AND price IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 8
    `;
    
    // Query for other major markets (4 properties)
    const otherMarketsQuery = `
      SELECT 
        id, title, price, bedrooms, bathrooms, area_sqm,
        property_type, city, state, neighborhood,
        CASE 
          WHEN image_url IS NOT NULL AND image_url NOT LIKE 'data:image%' 
          THEN image_url
          WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
          THEN images->0->>'url'
          ELSE NULL
        END as primary_image,
        created_at,
        'sale' as listing_type
      FROM properties 
      WHERE city = ANY($1::text[])
        AND property_type IN ('Casa', 'Departamento', 'Condominio')
        AND price IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 4
    `;

    const [cdmxResult, otherResult] = await Promise.all([
      pool.query(cdmxQuery, [cdmxAlcaldias]),
      pool.query(otherMarketsQuery, [majorMarkets])
    ]);

    const allProperties = [...cdmxResult.rows, ...otherResult.rows];
    
    // Shuffle to mix CDMX and other markets
    const shuffled = allProperties.sort(() => Math.random() - 0.5);

    res.json({
      success: true,
      data: shuffled,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching latest listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest listings'
    });
  }
});

/**
 * Get properties separated by sale and rent (cached)
 */
router.get('/by-listing-type', async (req, res) => {
  try {
    // Return cached data for better performance
    const cachedData = landingCache.getCachedByListingType();
    
    res.json({
      success: true,
      data: cachedData,
      lastUpdated: landingCache.getLastUpdated()
    });

  } catch (error) {
    logger.error('Error fetching properties by type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties by listing type'
    });
  }
});

/**
 * Get featured Mexico City properties
 */
router.get('/featured-cdmx', async (req, res) => {
  try {
    const cdmxAlcaldias = [
      'Cuauhtémoc', 'Miguel Hidalgo', 'Benito Juárez', 'Álvaro Obregón',
      'Coyoacán', 'Tlalpan', 'Polanco', 'Roma Norte', 'Condesa'
    ];

    const query = `
      SELECT 
        id, title, price, bedrooms, bathrooms, area_sqm,
        property_type, city, state, neighborhood,
        CASE 
          WHEN image_url IS NOT NULL AND image_url NOT LIKE 'data:image%' 
          THEN image_url
          WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
          THEN images->0->>'url'
          ELSE NULL
        END as primary_image,
        created_at,
        CASE 
          WHEN CAST(price AS NUMERIC) > 50000 THEN 'sale'
          ELSE 'rent'
        END as listing_type
      FROM properties 
      WHERE (city = ANY($1::text[]) OR neighborhood = ANY($1::text[]))
        AND property_type IN ('Casa', 'Departamento', 'Condominio')
        AND price IS NOT NULL
        AND image_url IS NOT NULL
      ORDER BY 
        CASE 
          WHEN neighborhood IN ('Polanco', 'Roma Norte', 'Condesa') THEN 0
          ELSE 1
        END,
        created_at DESC
      LIMIT 12
    `;

    const result = await pool.query(query, [cdmxAlcaldias]);

    res.json({
      success: true,
      data: result.rows,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching featured CDMX properties:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured properties'
    });
  }
});

/**
 * Get market statistics for homepage (cached)
 */
router.get('/market-stats', async (req, res) => {
  try {
    // Return cached data for better performance
    const cachedStats = landingCache.getCachedMarketStats();
    
    res.json({
      success: true,
      data: cachedStats,
      lastUpdated: landingCache.getLastUpdated()
    });

  } catch (error) {
    logger.error('Error fetching market stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market statistics'
    });
  }
});

module.exports = router;