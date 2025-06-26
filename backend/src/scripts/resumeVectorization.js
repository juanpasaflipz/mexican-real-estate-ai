require('dotenv').config();
const pool = require('../config/vectorDatabase');
const pineconeService = require('../services/pineconeService');
const logger = require('../utils/logger');

/**
 * Resume vectorization from where it left off
 */
async function resumeVectorization() {
  try {
    // Get current vector count
    await pineconeService.initialize();
    const stats = await pineconeService.getIndexStats();
    const vectorizedCount = stats.totalRecordCount || 0;
    
    console.log(`\n📊 Current vectors in index: ${vectorizedCount}`);
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM properties');
    const totalProperties = parseInt(countResult.rows[0].count);
    console.log(`📊 Total properties in database: ${totalProperties}`);
    
    if (vectorizedCount >= totalProperties) {
      console.log('✅ All properties are already vectorized!');
      process.exit(0);
    }
    
    console.log(`🚀 Resuming vectorization from property ${vectorizedCount + 1}...`);
    
    // Process remaining properties
    const batchSize = 50; // Smaller batch size for stability
    let offset = vectorizedCount;
    let processedCount = vectorizedCount;

    while (offset < totalProperties) {
      console.log(`\n📦 Processing batch starting at ${offset + 1}...`);
      
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
        
        console.log(`✅ Processed ${processedCount}/${totalProperties} properties (${((processedCount/totalProperties)*100).toFixed(1)}%)`);
        console.log(`   Last property: ${properties[properties.length-1].city}, ${properties[properties.length-1].state}`);
      }

      offset += batchSize;

      // Add a delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh database connection every 20 batches
      if ((offset - vectorizedCount) % (20 * batchSize) === 0) {
        console.log('🔄 Refreshing database connection...');
        await pool.query('SELECT 1'); // Keep connection alive
      }
    }

    // Get final stats
    const finalStats = await pineconeService.getIndexStats();
    console.log('\n📈 Vectorization complete!');
    console.log(`✅ Total vectors in index: ${finalStats.totalRecordCount}`);

  } catch (error) {
    console.error('❌ Error during vectorization:', error);
    logger.error('Vectorization error:', error);
    
    // Show progress before exiting
    try {
      const currentStats = await pineconeService.getIndexStats();
      console.log(`\n⚠️  Vectorization interrupted at ${currentStats.totalRecordCount} vectors`);
      console.log('Run this script again to resume from where it left off.');
    } catch (e) {
      // Ignore stats error
    }
    
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run
resumeVectorization();