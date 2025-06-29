const express = require('express')
const router = express.Router()
const pool = require('../config/database')

/**
 * Get nearby properties for a given property
 * @route GET /api/properties/:id/nearby
 * @param {string} id - Property ID
 * @query {number} radius - Search radius in kilometers (default: 2)
 */
router.get('/properties/:id/nearby', async (req, res) => {
  try {
    const { id } = req.params
    const { radius = 2 } = req.query
    
    // Validate radius
    const radiusKm = parseFloat(radius)
    if (isNaN(radiusKm) || radiusKm < 0.1 || radiusKm > 50) {
      return res.status(400).json({
        error: 'Invalid radius. Must be between 0.1 and 50 kilometers.'
      })
    }

    // First, get the target property
    const targetQuery = `
      SELECT 
        id, title, address, lat, lng, price, 
        area_sqm, bedrooms, bathrooms, property_type, 
        city, state, country, description, url, image_url
      FROM properties 
      WHERE id = $1
    `
    
    console.log('Fetching target property:', id)
    const targetResult = await pool.query(targetQuery, [id])
    
    if (targetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' })
    }
    
    const targetProperty = targetResult.rows[0]
    
    // Parse coordinates as numbers
    targetProperty.lat = parseFloat(targetProperty.lat)
    targetProperty.lng = parseFloat(targetProperty.lng)
    
    console.log('Target property found:', targetProperty.title, 'Lat:', targetProperty.lat, 'Lng:', targetProperty.lng)
    
    // Check if target property has coordinates
    if (isNaN(targetProperty.lat) || isNaN(targetProperty.lng)) {
      return res.status(400).json({ 
        error: 'Target property does not have valid coordinates',
        message: 'This property needs to be geocoded before nearby properties can be found'
      })
    }
    
    // Check if we have PostGIS available
    const checkPostGIS = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'st_distance'
      ) as has_postgis
    `)
    
    let nearbyProperties = []
    
    if (checkPostGIS.rows[0].has_postgis) {
      // Use PostGIS function if available
      try {
        const nearbyQuery = `
          SELECT * FROM get_nearby_properties($1::uuid, $2)
        `
        const nearbyResult = await pool.query(nearbyQuery, [id, radiusKm])
        nearbyProperties = nearbyResult.rows
      } catch (funcError) {
        console.log('PostGIS function not available, falling back to basic query')
        // Fall back to basic distance calculation
        nearbyProperties = await getNearbyPropertiesBasic(pool, targetProperty, radiusKm, id)
      }
    } else {
      // Use basic distance calculation without PostGIS
      nearbyProperties = await getNearbyPropertiesBasic(pool, targetProperty, radiusKm, id)
    }
    
    // Calculate statistics
    const stats = calculateStats(nearbyProperties)
    
    res.json({
      target: targetProperty,
      nearby: nearbyProperties,
      stats,
      radius: radiusKm,
      total: nearbyProperties.length
    })
    
  } catch (error) {
    console.error('Error fetching nearby properties:', error)
    res.status(500).json({ 
      error: 'Failed to fetch nearby properties',
      details: error.message 
    })
  }
})

/**
 * Basic nearby properties query without PostGIS
 * Uses Haversine formula for distance calculation
 */
async function getNearbyPropertiesBasic(pool, targetProperty, radiusKm, excludeId) {
  const { lat: targetLat, lng: targetLng } = targetProperty
  
  // Rough bounding box to limit initial results
  const latDiff = radiusKm / 111.0  // 1 degree latitude ≈ 111km
  const lngDiff = radiusKm / (111.0 * Math.cos(targetLat * Math.PI / 180))
  
  const query = `
    SELECT 
      id, title, address, lat, lng, price,
      area_sqm, bedrooms, bathrooms, property_type,
      city, state, country, description, url, image_url,
      -- Haversine formula for distance
      ROUND((
        6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians($1)) * cos(radians(lat)) *
            cos(radians(lng) - radians($2)) +
            sin(radians($1)) * sin(radians(lat))
          ))
        )
      )::numeric, 2) as dist_km
    FROM properties
    WHERE 
      id != $3
      AND lat BETWEEN $4 AND $5
      AND lng BETWEEN $6 AND $7
      AND lat IS NOT NULL 
      AND lng IS NOT NULL
      AND 6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians($1)) * cos(radians(lat)) *
          cos(radians(lng) - radians($2)) +
          sin(radians($1)) * sin(radians(lat))
        ))
      ) <= $8
    ORDER BY dist_km ASC
    LIMIT 100
  `
  
  const result = await pool.query(query, [
    targetLat,
    targetLng,
    excludeId,
    targetLat - latDiff,
    targetLat + latDiff,
    targetLng - lngDiff,
    targetLng + lngDiff,
    radiusKm
  ])
  
  return result.rows
}

/**
 * Calculate statistics for nearby properties
 */
function calculateStats(properties) {
  // Convert price strings to numbers
  const propertiesWithPrice = properties.filter(p => {
    const price = parseFloat(String(p.price).replace(/[^0-9.-]+/g, ''))
    return !isNaN(price) && price > 0
  }).map(p => ({
    ...p,
    numericPrice: parseFloat(String(p.price).replace(/[^0-9.-]+/g, ''))
  }))
  
  const stats = {
    totalProperties: properties.length,
    totalWithPrice: propertiesWithPrice.length,
    medianPrice: calculateMedian(propertiesWithPrice.map(p => p.numericPrice)),
    avgPricePerM2: 0,
    priceRange: {
      min: propertiesWithPrice.length > 0 ? Math.min(...propertiesWithPrice.map(p => p.numericPrice)) : 0,
      max: propertiesWithPrice.length > 0 ? Math.max(...propertiesWithPrice.map(p => p.numericPrice)) : 0
    }
  }
  
  // Calculate average price per m2
  const propertiesWithArea = propertiesWithPrice.filter(p => p.area_sqm > 0)
  if (propertiesWithArea.length > 0) {
    const totalPricePerM2 = propertiesWithArea.reduce((sum, p) => sum + (p.numericPrice / p.area_sqm), 0)
    stats.avgPricePerM2 = Math.round(totalPricePerM2 / propertiesWithArea.length)
  }
  
  return stats
}

/**
 * Calculate median value from array
 */
function calculateMedian(values) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

module.exports = router