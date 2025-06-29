require('dotenv').config()
const pool = require('../config/database')

async function fixCoordinateTypes() {
  const client = await pool.connect()
  
  try {
    console.log('Fixing coordinate data types...')
    
    // First, clear any invalid values
    await client.query(`
      UPDATE properties 
      SET lat = NULL, lng = NULL 
      WHERE lat !~ '^-?[0-9]+(\\.[0-9]+)?$' 
         OR lng !~ '^-?[0-9]+(\\.[0-9]+)?$'
    `)
    
    // Convert string coordinates to numeric
    await client.query(`
      UPDATE properties 
      SET 
        lat = CAST(lat AS NUMERIC),
        lng = CAST(lng AS NUMERIC)
      WHERE 
        lat IS NOT NULL 
        AND lng IS NOT NULL
    `)
    
    console.log('✓ Fixed coordinate types')
    
    // Verify
    const result = await client.query('SELECT id, lat, lng FROM properties WHERE id = $1', ['2'])
    console.log('Property 2 after fix:', result.rows[0])
    
    const typeCheck = await client.query(`
      SELECT 
        data_type,
        column_name
      FROM information_schema.columns 
      WHERE table_name = 'properties' 
      AND column_name IN ('lat', 'lng')
    `)
    console.log('Column types:', typeCheck.rows)
    
  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

fixCoordinateTypes()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Failed:', err.message))