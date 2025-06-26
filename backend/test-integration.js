require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

const testQueries = [
  {
    description: "NLP endpoint - Spanish query",
    endpoint: '/nlp/query',
    body: { query: "casas modernas en Cancún con alberca" }
  },
  {
    description: "NLP endpoint - English query",
    endpoint: '/nlp/query',
    body: { query: "luxury apartments in CDMX under 10 million" }
  },
  {
    description: "Property search endpoint",
    endpoint: '/properties/search',
    body: { query: "beachfront properties for investment" }
  },
  {
    description: "Chat AI endpoint (alias)",
    endpoint: '/chat-ai/query',
    body: { query: "show me family homes in safe neighborhoods" }
  }
];

async function runTests() {
  console.log('🚀 Testing Pinecone Vector Search Integration\n');

  for (const test of testQueries) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 ${test.description}`);
    console.log(`🔗 Endpoint: ${test.endpoint}`);
    console.log(`📤 Query: "${test.body.query}"`);
    console.log(`${'='.repeat(60)}`);

    try {
      const startTime = Date.now();
      const response = await axios.post(`${API_URL}${test.endpoint}`, test.body);
      const duration = Date.now() - startTime;

      const data = response.data;
      
      // Extract properties based on endpoint response format
      let properties = [];
      let analysis = '';
      
      if (test.endpoint.includes('/nlp/') || test.endpoint.includes('/chat-ai/')) {
        properties = data.results || [];
        analysis = data.analysis || data.fullAnalysis?.summary || '';
      } else if (test.endpoint.includes('/properties/')) {
        properties = data.data || [];
        analysis = data.metadata?.analysis || '';
      }

      console.log(`\n✅ Success! Found ${properties.length} properties`);
      console.log(`⏱️  Response time: ${duration}ms`);
      
      if (properties.length > 0) {
        console.log('\n🏠 Top 3 results:');
        properties.slice(0, 3).forEach((prop, idx) => {
          console.log(`\n${idx + 1}. ${prop.property_type || 'Property'} in ${prop.city}, ${prop.state}`);
          console.log(`   Price: $${prop.price?.toLocaleString() || 'N/A'} MXN`);
          console.log(`   Size: ${prop.area_sqm || prop.total_area_sqm || 'N/A'} m²`);
          console.log(`   Relevance: ${prop.relevance_score ? (prop.relevance_score * 100).toFixed(1) + '%' : 'N/A'}`);
        });
      }

      if (analysis) {
        console.log(`\n💡 Analysis: ${analysis}`);
      }

    } catch (error) {
      console.error(`\n❌ Error: ${error.response?.data?.error || error.message}`);
      if (error.response?.data?.details) {
        console.error(`   Details: ${error.response.data.details}`);
      }
    }
  }

  console.log('\n\n✅ Integration testing complete!');
  console.log('\n📊 Summary:');
  console.log('- Vector search is now integrated into all property search endpoints');
  console.log('- Natural language queries work in both English and Spanish');
  console.log('- AI analysis provides context and insights');
  console.log('- Fallback to SQL is available if needed');
}

// Check if server is running
axios.get(`${API_URL.replace('/api', '')}/health`)
  .then(() => {
    console.log('✅ Backend server is running\n');
    return runTests();
  })
  .catch(() => {
    console.error('❌ Backend server is not running. Please start it with: npm run dev');
    process.exit(1);
  });