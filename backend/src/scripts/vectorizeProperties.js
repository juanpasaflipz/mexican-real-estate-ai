require('dotenv').config();
const pool = require('../config/vectorDatabase');
const pineconeService = require('../services/pineconeService');
const logger = require('../utils/logger');

/**
 * Script to vectorize all properties in the database
 * and upload them to Pinecone for similarity search
 */
async function vectorizeProperties() {
  try {
    console.log('🚀 Starting property vectorization...');
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM properties');
    const totalProperties = parseInt(countResult.rows[0].count);
    console.log(`📊 Total properties to vectorize: ${totalProperties}`);

    // Process in batches
    const batchSize = 100;
    let offset = 0;
    let processedCount = 0;

    while (offset < totalProperties) {
      console.log(`\n📦 Processing batch ${Math.floor(offset / batchSize) + 1}...`);
      
      // Fetch batch of properties
      const query = `
        SELECT 
          id,
          title,
          description,
          property_type,
          city,
          state,
          neighborhood,
          address,
          price,
          bedrooms,
          bathrooms,
          area_sqm,
          total_area_sqm,
          built_area_sqm,
          parking_spaces,
          amenities,
          features
        FROM properties
        ORDER BY id
        LIMIT $1 OFFSET $2
      `;
      
      const result = await pool.query(query, [batchSize, offset]);
      const properties = result.rows;

      if (properties.length > 0) {
        // Upload to Pinecone
        await pineconeService.upsertProperties(properties);
        processedCount += properties.length;
        
        console.log(`✅ Processed ${processedCount}/${totalProperties} properties`);
        console.log(`   Sample: ${properties[0].city}, ${properties[0].state} - ${properties[0].property_type}`);
      }

      offset += batchSize;

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Get final stats
    const stats = await pineconeService.getIndexStats();
    console.log('\n📈 Vectorization complete!');
    console.log(`✅ Total vectors in index: ${stats.totalVectorCount}`);
    console.log(`📊 Index fullness: ${(stats.dimension?.indexFullness * 100).toFixed(2)}%`);

  } catch (error) {
    console.error('❌ Error during vectorization:', error);
    logger.error('Vectorization error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Add command line options
if (process.argv.includes('--help')) {
  console.log(`
Property Vectorization Script

This script reads all properties from the database and creates vector embeddings
for semantic search using OpenAI embeddings and Pinecone vector database.

Usage:
  node vectorizeProperties.js [options]

Options:
  --help        Show this help message
  --stats-only  Only show current index statistics without processing

Examples:
  node vectorizeProperties.js              # Vectorize all properties
  node vectorizeProperties.js --stats-only # Show index statistics
  `);
  process.exit(0);
}

if (process.argv.includes('--stats-only')) {
  // Only show stats
  (async () => {
    try {
      await pineconeService.initialize();
      const stats = await pineconeService.getIndexStats();
      console.log('\n📊 Pinecone Index Statistics:');
      console.log(JSON.stringify(stats, null, 2));
    } catch (error) {
      console.error('Error getting stats:', error);
    }
    process.exit(0);
  })();
} else {
  // Run vectorization
  vectorizeProperties();
}