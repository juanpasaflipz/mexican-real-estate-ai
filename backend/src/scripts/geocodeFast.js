require('dotenv').config();
const pool = require('../config/database');
const axios = require('axios');

// Alternative geocoding services that are faster or allow bulk requests:

// Option 1: Use Mapbox (requires API key)
async function geocodeWithMapbox(address, apiKey) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
  
  try {
    const response = await axios.get(url, {
      params: {
        access_token: apiKey,
        country: 'MX',
        limit: 1
      }
    });
    
    if (response.data.features && response.data.features.length > 0) {
      const [lng, lat] = response.data.features[0].center;
      return { lat, lng };
    }
    return null;
  } catch (error) {
    console.error('Mapbox error:', error.message);
    return null;
  }
}

// Option 2: Use Google Maps Geocoding API (requires API key)
async function geocodeWithGoogle(address, apiKey) {
  const url = 'https://maps.googleapis.com/maps/api/geocode/json';
  
  try {
    const response = await axios.get(url, {
      params: {
        address: address + ', Mexico',
        key: apiKey,
        region: 'mx'
      }
    });
    
    if (response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    return null;
  } catch (error) {
    console.error('Google error:', error.message);
    return null;
  }
}

// Option 3: Use OpenCage (free tier available, requires API key)
async function geocodeWithOpenCage(address, apiKey) {
  const url = 'https://api.opencagedata.com/geocode/v1/json';
  
  try {
    const response = await axios.get(url, {
      params: {
        q: address + ', Mexico',
        key: apiKey,
        countrycode: 'mx',
        limit: 1
      }
    });
    
    if (response.data.results && response.data.results.length > 0) {
      const geometry = response.data.results[0].geometry;
      return { lat: geometry.lat, lng: geometry.lng };
    }
    return null;
  } catch (error) {
    console.error('OpenCage error:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Fast Geocoding Options for Mexican Real Estate Properties\n');
  
  console.log('This script supports multiple geocoding services:');
  console.log('1. Mapbox - 100,000 requests/month free tier');
  console.log('2. Google Maps - $200 free credit/month');
  console.log('3. OpenCage - 2,500 requests/day free tier\n');
  
  console.log('To use this script, set one of these environment variables:');
  console.log('- MAPBOX_ACCESS_TOKEN');
  console.log('- GOOGLE_MAPS_API_KEY');
  console.log('- OPENCAGE_API_KEY\n');
  
  // Check which service to use
  const mapboxKey = process.env.MAPBOX_ACCESS_TOKEN;
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  const opencageKey = process.env.OPENCAGE_API_KEY;
  
  let geocodeFunction;
  let apiKey;
  let serviceName;
  let rateLimit;
  
  if (mapboxKey) {
    geocodeFunction = geocodeWithMapbox;
    apiKey = mapboxKey;
    serviceName = 'Mapbox';
    rateLimit = 600; // 600 requests per minute
  } else if (googleKey) {
    geocodeFunction = geocodeWithGoogle;
    apiKey = googleKey;
    serviceName = 'Google Maps';
    rateLimit = 50; // 50 requests per second
  } else if (opencageKey) {
    geocodeFunction = geocodeWithOpenCage;
    apiKey = opencageKey;
    serviceName = 'OpenCage';
    rateLimit = 1; // 1 request per second for free tier
  } else {
    console.log('❌ No API key found. Please set one of the environment variables listed above.');
    console.log('\nExample:');
    console.log('MAPBOX_ACCESS_TOKEN=your_key_here node src/scripts/geocodeFast.js\n');
    process.exit(1);
  }
  
  console.log(`✅ Using ${serviceName} for geocoding`);
  console.log(`Rate limit: ${rateLimit} requests per ${rateLimit > 50 ? 'minute' : 'second'}\n`);
  
  // Get batch size from command line or default to 1000
  const batchSize = parseInt(process.argv[2]) || 1000;
  
  // Get properties to geocode
  const query = `
    SELECT id, title, address, city, state
    FROM properties
    WHERE (lat IS NULL OR lng IS NULL)
    AND (address IS NOT NULL OR city IS NOT NULL OR state IS NOT NULL)
    ORDER BY id
    LIMIT $1
  `;
  
  const result = await pool.query(query, [batchSize]);
  const properties = result.rows;
  
  console.log(`Found ${properties.length} properties to geocode\n`);
  
  let successCount = 0;
  let processedCount = 0;
  const startTime = Date.now();
  const delay = serviceName === 'Mapbox' ? 100 : (1000 / rateLimit);
  
  for (const property of properties) {
    processedCount++;
    const address = [property.address, property.city, property.state]
      .filter(Boolean)
      .join(', ');
    
    process.stdout.write(`Geocoding ${property.id}: ${address.substring(0, 50)}...`);
    
    const coords = await geocodeFunction(address, apiKey);
    
    if (coords) {
      await pool.query(
        'UPDATE properties SET lat = $1, lng = $2, updated_at = NOW() WHERE id = $3',
        [coords.lat, coords.lng, property.id]
      );
      console.log(` ✅ ${coords.lat}, ${coords.lng}`);
      successCount++;
    } else {
      console.log(' ❌ Failed');
    }
    
    // Show progress every 10 properties
    if (processedCount % 10 === 0 || processedCount === properties.length) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = processedCount / elapsed;
      console.log(`Progress: ${processedCount}/${properties.length} (${Math.round(processedCount/properties.length*100)}%) | Rate: ${rate.toFixed(1)}/s | Success: ${successCount}`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  const totalTime = (Date.now() - startTime) / 1000;
  console.log(`\n✅ Complete!`);
  console.log(`Geocoded ${successCount} out of ${properties.length} properties (${Math.round(successCount/properties.length*100)}% success rate)`);
  console.log(`Total time: ${totalTime.toFixed(1)} seconds`);
  console.log(`Average rate: ${(properties.length / totalTime).toFixed(1)} properties/second`);
  
  // Check how many still need geocoding
  const remainingQuery = `
    SELECT COUNT(*) as count
    FROM properties
    WHERE (lat IS NULL OR lng IS NULL)
    AND (address IS NOT NULL OR city IS NOT NULL OR state IS NOT NULL)
  `;
  const remainingResult = await pool.query(remainingQuery);
  console.log(`\nRemaining properties to geocode: ${remainingResult.rows[0].count}`);
  
  process.exit(0);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});