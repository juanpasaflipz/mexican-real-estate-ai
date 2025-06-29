require('dotenv').config();
const pool = require('../config/database');
const axios = require('axios');

// Configuration
const BATCH_SIZE = 50; // Process 50 properties at a time
const DELAY_BETWEEN_REQUESTS = 1100; // 1.1 seconds to be safe with rate limits
const CONCURRENT_REQUESTS = 1; // Nominatim requires sequential requests

// Progress tracking
let totalProcessed = 0;
let totalSuccess = 0;
let totalFailed = 0;
let startTime = Date.now();

// Using Nominatim (OpenStreetMap) - free, no API key required
async function geocodeAddress(address) {
  const url = 'https://nominatim.openstreetmap.org/search';
  
  try {
    const response = await axios.get(url, {
      params: {
        q: address + ', Mexico',
        format: 'json',
        limit: 1,
        countrycodes: 'mx'
      },
      headers: {
        'User-Agent': 'Mexican-Real-Estate-Platform/1.0'
      },
      timeout: 10000 // 10 second timeout
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
    if (error.code === 'ECONNABORTED') {
      console.log('Request timeout');
    } else {
      console.log('Geocoding error:', error.message);
    }
    return null;
  }
}

// Build address string from available fields
function buildAddressString(property) {
  const parts = [];
  
  // Try to build a clean address
  if (property.address && property.address.length > 10) {
    // Clean the address field
    let cleanAddress = property.address
      .replace(/^\d+\s*-\s*/, '') // Remove leading numbers with dash
      .replace(/\s+/g, ' ')
      .trim();
    parts.push(cleanAddress);
  } else {
    // Build from city and state
    if (property.city && property.city !== 'NULL') {
      parts.push(property.city);
    }
    if (property.state && property.state !== 'NULL') {
      parts.push(property.state);
    }
  }
  
  return parts.join(', ');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

async function geocodeAllProperties() {
  try {
    // Get total count of properties needing geocoding
    const countQuery = `
      SELECT COUNT(*) as total
      FROM properties
      WHERE (lat IS NULL OR lng IS NULL)
      AND (address IS NOT NULL OR city IS NOT NULL OR state IS NOT NULL)
    `;
    
    const countResult = await pool.query(countQuery);
    const totalToProcess = parseInt(countResult.rows[0].total);
    
    console.log(`🌍 Geocoding Properties for Mexican Real Estate Platform`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.log(`Total properties to geocode: ${totalToProcess.toLocaleString()}`);
    console.log(`Batch size: ${BATCH_SIZE}`);
    console.log(`Rate limit delay: ${DELAY_BETWEEN_REQUESTS}ms per request`);
    console.log(`Estimated time: ${formatTime(totalToProcess * DELAY_BETWEEN_REQUESTS)}\n`);
    
    if (totalToProcess === 0) {
      console.log('✅ All properties already have coordinates!');
      process.exit(0);
    }
    
    console.log('Press Ctrl+C at any time to stop. Progress is saved.\n');
    
    // Process in batches
    while (totalProcessed < totalToProcess) {
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
      
      if (properties.length === 0) break;
      
      console.log(`\n📦 Processing batch: ${totalProcessed + 1} to ${totalProcessed + properties.length}`);
      
      for (const property of properties) {
        const address = buildAddressString(property);
        
        // Skip if address is too short or invalid
        if (!address || address.length < 5) {
          console.log(`⏭️  Skipping ID ${property.id} - Invalid address`);
          totalFailed++;
          totalProcessed++;
          continue;
        }
        
        process.stdout.write(`🔍 Geocoding ${property.id}: ${address.substring(0, 50)}...`);
        
        const geocodeResult = await geocodeAddress(address);
        
        if (geocodeResult) {
          // Update the property with coordinates
          const updateQuery = `
            UPDATE properties 
            SET lat = $1, lng = $2, updated_at = NOW()
            WHERE id = $3
          `;
          
          await pool.query(updateQuery, [geocodeResult.lat, geocodeResult.lng, property.id]);
          
          console.log(` ✅ ${geocodeResult.lat}, ${geocodeResult.lng}`);
          totalSuccess++;
        } else {
          console.log(' ❌ Failed');
          totalFailed++;
        }
        
        totalProcessed++;
        
        // Show progress
        const progress = (totalProcessed / totalToProcess * 100).toFixed(1);
        const elapsed = Date.now() - startTime;
        const rate = totalProcessed / (elapsed / 1000); // per second
        const remaining = (totalToProcess - totalProcessed) / rate;
        
        process.stdout.write(`\r⏱️  Progress: ${progress}% | Success: ${totalSuccess} | Failed: ${totalFailed} | Rate: ${rate.toFixed(1)}/s | ETA: ${formatTime(remaining * 1000)}     `);
        
        // Respect rate limit
        await sleep(DELAY_BETWEEN_REQUESTS);
      }
    }
    
    // Final report
    const totalTime = Date.now() - startTime;
    console.log(`\n\n✅ Geocoding Complete!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.log(`Total processed: ${totalProcessed.toLocaleString()}`);
    console.log(`Successful: ${totalSuccess.toLocaleString()} (${(totalSuccess/totalProcessed*100).toFixed(1)}%)`);
    console.log(`Failed: ${totalFailed.toLocaleString()} (${(totalFailed/totalProcessed*100).toFixed(1)}%)`);
    console.log(`Total time: ${formatTime(totalTime)}`);
    console.log(`Average rate: ${(totalProcessed / (totalTime / 1000)).toFixed(1)} properties/second`);
    
    // Check remaining
    const remainingResult = await pool.query(countQuery);
    const remaining = parseInt(remainingResult.rows[0].total);
    if (remaining > 0) {
      console.log(`\n⚠️  ${remaining.toLocaleString()} properties still need geocoding.`);
      console.log('Run this script again to continue.');
    } else {
      console.log('\n🎉 All properties now have coordinates!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Geocoding interrupted by user');
  console.log(`Progress saved: ${totalSuccess} properties geocoded`);
  process.exit(0);
});

// Start geocoding
console.log('Starting in 3 seconds...');
setTimeout(() => {
  geocodeAllProperties();
}, 3000);