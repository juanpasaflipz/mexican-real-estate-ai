require('dotenv').config();
const pool = require('../config/database');

async function checkProperties() {
  try {
    // Check total properties and how many have coordinates
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as with_coords,
        COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL AND city IS NOT NULL THEN 1 END) as with_coords_and_city
      FROM properties
    `;
    
    const statsResult = await pool.query(statsQuery);
    console.log('Property Statistics:', statsResult.rows[0]);
    
    // Get sample properties with coordinates
    const sampleQuery = `
      SELECT id, title, city, state, lat, lng
      FROM properties
      WHERE lat IS NOT NULL AND lng IS NOT NULL
      LIMIT 10
    `;
    
    const sampleResult = await pool.query(sampleQuery);
    console.log('\nSample properties with coordinates:');
    sampleResult.rows.forEach(p => {
      console.log(`- ${p.id}: ${p.title} (${p.city || 'No city'}, ${p.state || 'No state'}) - Lat: ${p.lat}, Lng: ${p.lng}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProperties();