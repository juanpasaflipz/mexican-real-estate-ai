const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * Service to cache and update landing page data
 * Runs every 12 hours to ensure fresh content
 */
class LandingCacheService {
  constructor() {
    this.cache = {
      latestListings: null,
      byListingType: null,
      featuredCDMX: null,
      marketStats: null,
      lastUpdated: null
    };
    
    // Start the cache update cycle
    this.initializeCache();
    this.startUpdateCycle();
  }

  async initializeCache() {
    logger.info('Initializing landing page cache...');
    await this.updateCache();
  }

  startUpdateCycle() {
    // Update cache every 12 hours
    setInterval(() => {
      this.updateCache();
    }, 12 * 60 * 60 * 1000);
    
    logger.info('Landing cache update cycle started (12 hour intervals)');
  }

  async updateCache() {
    try {
      logger.info('Updating landing page cache...');
      
      const [latestListings, byListingType, featuredCDMX, marketStats] = await Promise.all([
        this.getLatestListings(),
        this.getByListingType(),
        this.getFeaturedCDMX(),
        this.getMarketStats()
      ]);

      this.cache = {
        latestListings,
        byListingType,
        featuredCDMX,
        marketStats,
        lastUpdated: new Date().toISOString()
      };

      logger.info('Landing page cache updated successfully');
    } catch (error) {
      logger.error('Error updating landing cache:', error);
    }
  }

  async getLatestListings() {
    const cdmxAlcaldias = [
      'Cuauhtémoc', 'Miguel Hidalgo', 'Benito Juárez', 'Álvaro Obregón',
      'Coyoacán', 'Tlalpan', 'Xochimilco', 'Azcapotzalco'
    ];
    
    const majorMarkets = [
      'Guadalajara', 'Monterrey', 'Puebla', 'Cancún', 
      'Playa del Carmen', 'Querétaro', 'San Miguel de Allende'
    ];

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
        created_at
      FROM properties 
      WHERE city = ANY($1::text[])
        AND property_type IN ('Casa', 'Departamento', 'Condominio')
        AND price IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 8
    `;
    
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
        created_at
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

    return [...cdmxResult.rows, ...otherResult.rows].sort(() => Math.random() - 0.5);
  }

  async getByListingType() {
    const cdmxAlcaldias = [
      'Cuauhtémoc', 'Miguel Hidalgo', 'Benito Juárez', 'Álvaro Obregón',
      'Coyoacán', 'Tlalpan', 'Xochimilco', 'Azcapotzalco'
    ];

    const forSaleQuery = `
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
        created_at
      FROM properties 
      WHERE property_type IN ('Casa', 'Departamento', 'Condominio')
        AND price IS NOT NULL
        AND CAST(price AS NUMERIC) > 50000
        AND (city = ANY($1::text[]) OR city IN ('Guadalajara', 'Monterrey', 'Cancún'))
      ORDER BY created_at DESC
      LIMIT 8
    `;

    const forRentQuery = `
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
        created_at
      FROM properties 
      WHERE property_type IN ('Casa', 'Departamento', 'Condominio')
        AND price IS NOT NULL
        AND CAST(price AS NUMERIC) <= 50000
        AND CAST(price AS NUMERIC) > 1000
        AND (city = ANY($1::text[]) OR city IN ('Guadalajara', 'Monterrey', 'Cancún'))
      ORDER BY created_at DESC
      LIMIT 8
    `;

    const [forSaleResult, forRentResult] = await Promise.all([
      pool.query(forSaleQuery, [cdmxAlcaldias]),
      pool.query(forRentQuery, [cdmxAlcaldias])
    ]);

    return {
      forSale: forSaleResult.rows,
      forRent: forRentResult.rows
    };
  }

  async getFeaturedCDMX() {
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
    return result.rows;
  }

  async getMarketStats() {
    const statsQuery = `
      WITH stats AS (
        SELECT 
          COUNT(*) as total_properties,
          COUNT(DISTINCT city) as total_cities,
          AVG(CAST(price AS NUMERIC)) as avg_price,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_this_week
        FROM properties
        WHERE property_type IN ('Casa', 'Departamento', 'Condominio')
          AND price IS NOT NULL
      )
      SELECT * FROM stats
    `;

    const result = await pool.query(statsQuery);
    return result.rows[0];
  }

  // Public methods to get cached data
  getCachedLatestListings() {
    return this.cache.latestListings || [];
  }

  getCachedByListingType() {
    return this.cache.byListingType || { forSale: [], forRent: [] };
  }

  getCachedFeaturedCDMX() {
    return this.cache.featuredCDMX || [];
  }

  getCachedMarketStats() {
    return this.cache.marketStats || {};
  }

  getLastUpdated() {
    return this.cache.lastUpdated;
  }

  // Force cache update
  async forceUpdate() {
    await this.updateCache();
    return { success: true, lastUpdated: this.cache.lastUpdated };
  }
}

// Create singleton instance
module.exports = new LandingCacheService();