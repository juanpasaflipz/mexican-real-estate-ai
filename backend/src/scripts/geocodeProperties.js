require('dotenv').config();
const pool = require('../config/database');
const axios = require('axios');

// Configuration
const BATCH_SIZE = 10; // Process 10 properties at a time
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay to respect rate limits
const MAX_RETRIES = 3;

// Using Nominatim (OpenStreetMap) - free, no API key required
// Rate limit: 1 request per second
async function geocodeAddress(address) {
  const url = 'https://nominatim.openstreetmap.org/search';
  
  try {
    const response = await axios.get(url, {
      params: {
        q: address + ', Mexico', // Append Mexico to improve results
        format: 'json',
        limit: 1,
        countrycodes: 'mx' // Restrict to Mexico
      },
      headers: {
        'User-Agent': 'Mexican-Real-Estate-Platform/1.0' // Required by Nominatim
      }
    });
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
}

// Build address string from available fields
function buildAddressString(property) {
  const parts = [];
  
  if (property.address) {
    parts.push(property.address);
  } else {
    // If no address, use city and state
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
  }
  
  // Clean up the address
  const address = parts.join(', ')
    .replace(/\s+/g, ' ') // Remove extra spaces
    .trim();
  
  return address;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeProperties() {
  try {
    console.log('Starting geocoding process...\n');
    
    // Get properties that need geocoding
    const query = `
      SELECT id, title, address, city, state, neighborhood
      FROM properties
      WHERE (lat IS NULL OR lng IS NULL)
      AND (address IS NOT NULL OR city IS NOT NULL OR state IS NOT NULL)
      ORDER BY id
      LIMIT $1
    `;
    
    const result = await pool.query(query, [BATCH_SIZE]);
    const properties = result.rows;
    
    if (properties.length === 0) {
      console.log('No properties need geocoding.');
      process.exit(0);
    }
    
    console.log(`Found ${properties.length} properties to geocode.\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const property of properties) {
      const address = buildAddressString(property);
      console.log(`\nProcessing ID ${property.id}: ${property.title}`);
      console.log(`Address: ${address}`);
      
      const geocodeResult = await geocodeAddress(address);
      
      if (geocodeResult) {
        // Update the property with coordinates
        const updateQuery = `
          UPDATE properties 
          SET lat = $1, lng = $2, updated_at = NOW()
          WHERE id = $3
        `;
        
        await pool.query(updateQuery, [geocodeResult.lat, geocodeResult.lng, property.id]);
        
        console.log(`✓ Success! Lat: ${geocodeResult.lat}, Lng: ${geocodeResult.lng}`);
        console.log(`  Location: ${geocodeResult.display_name}`);
        successCount++;
      } else {
        console.log('✗ Failed to geocode');
        failCount++;
      }
      
      // Respect rate limit
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
    
    console.log(`\n\nGeocoding complete!`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`\nRun this script again to process more properties.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Add command line option to geocode all at once (use with caution!)
if (process.argv[2] === '--all') {
  console.log('WARNING: Geocoding all properties will take a long time due to rate limits.');
  console.log('Estimated time: ~3.3 hours for 11,955 properties');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  
  setTimeout(() => {
    geocodeAllProperties();
  }, 5000);
} else {
  geocodeProperties();
}

async function geocodeAllProperties() {
  // This function would geocode all properties in batches
  // Implementation left as exercise
  console.log('Full geocoding not implemented yet. Use the regular batch mode.');
  process.exit(0);
}