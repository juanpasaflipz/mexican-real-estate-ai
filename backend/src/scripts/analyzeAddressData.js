require('dotenv').config();
const pool = require('../config/database');

async function analyzeAddressData() {
  try {
    // Check what address fields we have
    const sampleQuery = `
      SELECT 
        id, 
        title, 
        address, 
        city, 
        state, 
        neighborhood,
        description
      FROM properties
      WHERE address IS NOT NULL OR city IS NOT NULL OR state IS NOT NULL
      LIMIT 10
    `;
    
    const sampleResult = await pool.query(sampleQuery);
    console.log('Sample properties with address data:');
    sampleResult.rows.forEach(p => {
      console.log(`\nID: ${p.id}`);
      console.log(`Title: ${p.title}`);
      console.log(`Address: ${p.address || 'NULL'}`);
      console.log(`City: ${p.city || 'NULL'}`);
      console.log(`State: ${p.state || 'NULL'}`);
      console.log(`Neighborhood: ${p.neighborhood || 'NULL'}`);
      console.log(`Description excerpt: ${p.description ? p.description.substring(0, 100) + '...' : 'NULL'}`);
    });
    
    // Check coverage
    const coverageQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(address) as with_address,
        COUNT(city) as with_city,
        COUNT(state) as with_state,
        COUNT(neighborhood) as with_neighborhood,
        COUNT(CASE WHEN address IS NOT NULL OR city IS NOT NULL OR state IS NOT NULL THEN 1 END) as with_any_location
      FROM properties
    `;
    
    const coverageResult = await pool.query(coverageQuery);
    console.log('\n\nAddress data coverage:', coverageResult.rows[0]);
    
    // Check properties that need geocoding
    const needsGeocodingQuery = `
      SELECT COUNT(*) as needs_geocoding
      FROM properties
      WHERE (lat IS NULL OR lng IS NULL)
      AND (address IS NOT NULL OR city IS NOT NULL OR state IS NOT NULL)
    `;
    
    const needsGeocodingResult = await pool.query(needsGeocodingQuery);
    console.log('\nProperties that need geocoding:', needsGeocodingResult.rows[0].needs_geocoding);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

analyzeAddressData();