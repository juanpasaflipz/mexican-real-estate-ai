require('dotenv').config()
const pool = require('../config/database')

/**
 * Simple script to add sample coordinates to properties for testing
 * This is a lighter version that just updates a few properties
 */
async function addSampleCoordinates() {
  let client;
  
  try {
    console.log('Connecting to database...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
    // Try to get a client with shorter timeout
    client = await pool.connect()
    console.log('✓ Connected to database')
    
    // First, check if lat/lng columns exist
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'properties' 
      AND column_name IN ('lat', 'lng')
    `)
    
    if (checkColumns.rows.length < 2) {
      console.log('Adding lat/lng columns...')
      
      try {
        await client.query(`
          ALTER TABLE properties 
          ADD COLUMN IF NOT EXISTS lat NUMERIC,
          ADD COLUMN IF NOT EXISTS lng NUMERIC
        `)
        console.log('✓ Added lat/lng columns')
      } catch (err) {
        console.log('Columns might already exist:', err.message)
      }
    } else {
      console.log('✓ lat/lng columns already exist')
    }
    
    // Sample coordinates for major Mexican cities
    const sampleUpdates = [
      { id: '2', lat: 19.4326, lng: -99.1332, name: 'Mexico City - Polanco' },
      { id: '3', lat: 19.4199, lng: -99.1605, name: 'Mexico City - Roma Norte' },
      { id: '4', lat: 19.4127, lng: -99.1717, name: 'Mexico City - Condesa' },
      { id: '5', lat: 19.3574, lng: -99.0889, name: 'Mexico City - Iztapalapa' },
      { id: '6', lat: 20.5888, lng: -100.3899, name: 'Querétaro' },
      { id: '7', lat: 25.6866, lng: -100.3161, name: 'Monterrey' },
      { id: '8', lat: 20.6597, lng: -103.3496, name: 'Guadalajara' },
      { id: '9', lat: 21.1619, lng: -86.8515, name: 'Cancún' },
      { id: '10', lat: 20.9674, lng: -89.5926, name: 'Mérida' }
    ]
    
    // Update properties with sample coordinates
    for (const update of sampleUpdates) {
      try {
        const result = await client.query(
          'UPDATE properties SET lat = $1, lng = $2 WHERE id = $3',
          [update.lat, update.lng, update.id]
        )
        
        if (result.rowCount > 0) {
          console.log(`✓ Updated property ${update.id} with ${update.name} coordinates`)
        } else {
          console.log(`- Property ${update.id} not found`)
        }
      } catch (err) {
        console.log(`Error updating property ${update.id}:`, err.message)
      }
    }
    
    // Get summary
    const summary = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(lat) as with_coordinates
      FROM properties
      WHERE id::integer <= 20
    `)
    
    console.log('\nSummary:')
    console.log(`Total properties (first 20): ${summary.rows[0].total}`)
    console.log(`With coordinates: ${summary.rows[0].with_coordinates}`)
    
    console.log('\nSample coordinates added successfully!')
    console.log('You can now test the Nearby Map feature with these properties.')
    
  } catch (error) {
    console.error('Error:', error.message)
    console.error('Make sure your DATABASE_URL is set in the .env file')
    throw error
  } finally {
    if (client) {
      client.release()
    }
    // Close the pool
    await pool.end()
  }
}

// Run the script
if (require.main === module) {
  addSampleCoordinates()
    .then(() => {
      console.log('Done!')
      process.exit(0)
    })
    .catch(error => {
      console.error('Failed:', error.message)
      process.exit(1)
    })
}

module.exports = { addSampleCoordinates }