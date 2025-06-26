require('dotenv').config();
const pineconeService = require('./src/services/pineconeService');

const testQueries = [
  // Bilingual synonyms
  { query: "beautiful house with garden", description: "English: house with garden" },
  { query: "hermosa casa con jardín", description: "Spanish: same meaning" },
  
  // Property type variations
  { query: "modern apartment downtown", description: "Apartment in city center" },
  { query: "departamento moderno céntrico", description: "Spanish equivalent" },
  { query: "contemporary flat in the city", description: "British English synonym" },
  
  // Feature-based searches
  { query: "family home with pool and garage", description: "Multiple features" },
  { query: "luxury property with amenities", description: "High-end search" },
  { query: "affordable starter home", description: "Budget-conscious search" },
  
  // Location fuzzy matching
  { query: "properties near good schools", description: "Lifestyle search" },
  { query: "quiet neighborhood for retirement", description: "Demographic search" },
  { query: "investment opportunity with rental potential", description: "Investor search" },
  
  // Natural language queries
  { query: "necesito casa grande para mi familia en zona segura", description: "Full Spanish sentence" },
  { query: "looking for beachfront condo for vacation", description: "Vacation property" },
  { query: "oficina con buena ubicación para mi negocio", description: "Commercial property" }
];

async function runExamples() {
  console.log('🚀 Vector Search Examples\n');
  console.log('Demonstrating semantic search capabilities...\n');
  
  await pineconeService.initialize();
  
  for (const test of testQueries) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 ${test.description}`);
    console.log(`🔍 Query: "${test.query}"`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      const results = await pineconeService.searchProperties(test.query, {}, 3);
      
      if (results.length > 0) {
        console.log(`✅ Found ${results.length} matches:\n`);
        
        results.forEach((result, index) => {
          console.log(`${index + 1}. ${result.property_type} in ${result.city}, ${result.state}`);
          console.log(`   Score: ${result.score.toFixed(4)} (${(result.score * 100).toFixed(1)}% match)`);
          console.log(`   Price: $${result.price.toLocaleString()} MXN`);
          console.log(`   Size: ${result.square_meters || 'N/A'} m²`);
          console.log(`   Bedrooms: ${result.bedrooms || 'N/A'}, Bathrooms: ${result.bathrooms || 'N/A'}`);
          if (result.neighborhood) {
            console.log(`   Neighborhood: ${result.neighborhood}`);
          }
        });
      } else {
        console.log('❌ No matches found');
      }
      
      // Small delay between queries
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n\n📊 Summary:');
  console.log('- Vector search understands context and meaning');
  console.log('- Works seamlessly in English and Spanish');
  console.log('- Matches based on semantic similarity, not just keywords');
  console.log('- Handles synonyms, variations, and natural language');
}

runExamples();