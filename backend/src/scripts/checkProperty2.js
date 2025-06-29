require('dotenv').config()
const pool = require('../config/database')

async function checkProperty() {
  try {
    const result = await pool.query('SELECT id, lat, lng, title FROM properties WHERE id = $1', ['2'])
    console.log('Property 2:', result.rows[0])
    
    // Check if coordinates look correct
    const { lat, lng } = result.rows[0]
    console.log('Lat type:', typeof lat, 'Value:', lat)
    console.log('Lng type:', typeof lng, 'Value:', lng)
    
    // Check how many properties have coordinates
    const countResult = await pool.query('SELECT COUNT(*) FROM properties WHERE lat IS NOT NULL AND lng IS NOT NULL')
    console.log('Properties with coordinates:', countResult.rows[0].count)
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await pool.end()
  }
}

checkProperty()