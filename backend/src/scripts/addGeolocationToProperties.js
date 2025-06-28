require('dotenv').config()
const pool = require('../config/database')

/**
 * Script to add lat/lng columns to properties table
 * Run this to enable map-based features
 */
async function addGeolocationColumns() {
  const client = await pool.connect()
  
  try {
    console.log('Adding geolocation columns to properties table...')
    
    // Add lat/lng columns if they don't exist
    await client.query(`
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS lat NUMERIC,
      ADD COLUMN IF NOT EXISTS lng NUMERIC
    `)
    
    console.log('✓ Added lat/lng columns')
    
    // Add indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_properties_lat ON properties(lat);
      CREATE INDEX IF NOT EXISTS idx_properties_lng ON properties(lng);
      CREATE INDEX IF NOT EXISTS idx_properties_lat_lng ON properties(lat, lng);
    `)
    
    console.log('✓ Added indexes for lat/lng')
    
    // Check if PostGIS is available
    const postgisCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'postgis'
      ) as has_postgis
    `)
    
    if (postgisCheck.rows[0].has_postgis) {
      console.log('PostGIS is available, adding geometry column...')
      
      await client.query(`
        ALTER TABLE properties 
        ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326)
      `)
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_properties_geom 
        ON properties USING GIST (geom)
      `)
      
      console.log('✓ Added PostGIS geometry column and spatial index')
    } else {
      console.log('PostGIS not available - spatial queries will use basic distance calculations')
    }
    
    // Update some properties with sample coordinates for testing
    // These are real coordinates for major Mexican cities
    const sampleCoordinates = [
      { city: 'Polanco', lat: 19.4326, lng: -99.1332 },
      { city: 'Roma Norte', lat: 19.4199, lng: -99.1605 },
      { city: 'Condesa', lat: 19.4127, lng: -99.1717 },
      { city: 'Santa Fe', lat: 19.3665, lng: -99.2598 },
      { city: 'Coyoacán', lat: 19.3506, lng: -99.1621 },
      { city: 'Cuauhtémoc', lat: 19.4271, lng: -99.1447 },
      { city: 'Miguel Hidalgo', lat: 19.4347, lng: -99.1915 },
      { city: 'Benito Juárez', lat: 19.3857, lng: -99.1592 },
      { city: 'Iztapalapa', lat: 19.3574, lng: -99.0889 },
      { city: 'Cancún', lat: 21.1619, lng: -86.8515 },
      { city: 'Playa del Carmen', lat: 20.6296, lng: -87.0739 },
      { city: 'Tulum', lat: 20.2114, lng: -87.4654 },
      { city: 'Mérida', lat: 20.9674, lng: -89.5926 },
      { city: 'Monterrey', lat: 25.6866, lng: -100.3161 },
      { city: 'Guadalajara', lat: 20.6597, lng: -103.3496 }
    ]
    
    // Update properties with coordinates based on city name match
    for (const coord of sampleCoordinates) {
      const result = await client.query(`
        UPDATE properties 
        SET lat = $1, lng = $2
        WHERE (city ILIKE $3 OR location ILIKE $3 OR address ILIKE $3)
        AND lat IS NULL
        LIMIT 50
      `, [coord.lat, coord.lng, `%${coord.city}%`])
      
      if (result.rowCount > 0) {
        console.log(`✓ Updated ${result.rowCount} properties in ${coord.city} with coordinates`)
      }
    }
    
    // If PostGIS is available, update geometry column
    if (postgisCheck.rows[0].has_postgis) {
      await client.query(`
        UPDATE properties 
        SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
        WHERE lat IS NOT NULL AND lng IS NOT NULL AND geom IS NULL
      `)
      console.log('✓ Updated geometry column for properties with coordinates')
    }
    
    // Get statistics
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(lat) as with_coordinates,
        COUNT(*) - COUNT(lat) as without_coordinates
      FROM properties
    `)
    
    console.log('\nStatistics:')
    console.log(`Total properties: ${stats.rows[0].total}`)
    console.log(`With coordinates: ${stats.rows[0].with_coordinates}`)
    console.log(`Without coordinates: ${stats.rows[0].without_coordinates}`)
    
    console.log('\nGeolocation columns added successfully!')
    console.log('Note: To geocode remaining properties, you\'ll need to use a geocoding service.')
    
  } catch (error) {
    console.error('Error adding geolocation columns:', error)
    throw error
  } finally {
    client.release()
  }
}

// Run the script
if (require.main === module) {
  addGeolocationColumns()
    .then(() => {
      console.log('Done!')
      process.exit(0)
    })
    .catch(error => {
      console.error('Failed:', error)
      process.exit(1)
    })
}

module.exports = { addGeolocationColumns }