require('dotenv').config();
const pineconeService = require('./src/services/pineconeService');

async function quickTest() {
  try {
    console.log('🔍 Testing vector search directly...\n');
    
    // Test query
    const query = "modern house with pool in Mexico";
    console.log(`Query: "${query}"`);
    
    // Perform search
    const results = await pineconeService.searchProperties(query, {}, 5);
    
    console.log(`\n✅ Found ${results.length} results`);
    
    if (results.length > 0) {
      console.log('\nTop matches:');
      results.forEach((result, index) => {
        console.log(`${index + 1}. Property ID: ${result.property_id}`);
        console.log(`   Score: ${result.score.toFixed(4)}`);
        console.log(`   Location: ${result.city}, ${result.state}`);
        console.log(`   Type: ${result.property_type}`);
        console.log(`   Price: $${result.price} MXN`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest();