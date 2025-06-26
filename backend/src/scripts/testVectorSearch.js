require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';

/**
 * Test cases for vector search with synonyms and fuzzy queries
 */
const testQueries = [
  // Synonym tests
  {
    name: 'Synonym Test 1: House/Casa',
    queries: [
      'beautiful house in Polanco',
      'hermosa casa en Polanco',
      'nice home in Polanco area'
    ]
  },
  {
    name: 'Synonym Test 2: Apartment variations',
    queries: [
      'modern apartment downtown',
      'departamento moderno en el centro',
      'contemporary flat in city center',
      'depa nuevo céntrico'
    ]
  },
  
  // Fuzzy location tests
  {
    name: 'Fuzzy Location Test 1: Neighborhoods',
    queries: [
      'properties near Roma Norte',
      'homes close to La Condesa',
      'casas cerca de Coyoacán',
      'housing around Satelite area'
    ]
  },
  {
    name: 'Fuzzy Location Test 2: Misspellings',
    queries: [
      'casa en Polnco',  // Misspelled Polanco
      'departamento en Cancn',  // Missing ú
      'propiedad en Meida'  // Misspelled Mérida
    ]
  },
  
  // Feature-based searches
  {
    name: 'Feature Search 1: Amenities',
    queries: [
      'house with swimming pool',
      'casa con alberca',
      'property with gym and pool',
      'departamento con amenidades'
    ]
  },
  {
    name: 'Feature Search 2: Family needs',
    queries: [
      'family home with garden',
      'casa familiar con jardín',
      'kid-friendly neighborhood',
      'safe area for children'
    ]
  },
  
  // Price-based natural language
  {
    name: 'Price Search: Natural language',
    queries: [
      'affordable homes in CDMX',
      'luxury properties in Cancun',
      'casas baratas en Querétaro',
      'high-end condos beachfront'
    ]
  },
  
  // Lifestyle searches
  {
    name: 'Lifestyle Search',
    queries: [
      'walkable neighborhood with cafes',
      'quiet residential area',
      'zona tranquila para vivir',
      'trendy area for young professionals'
    ]
  },
  
  // Investment searches
  {
    name: 'Investment Search',
    queries: [
      'good investment opportunity',
      'rental properties with high ROI',
      'propiedades para inversión',
      'Airbnb potential properties'
    ]
  },
  
  // Complex queries
  {
    name: 'Complex Query',
    queries: [
      'modern 3 bedroom apartment with parking in Roma Norte under 5 million',
      'beach house for weekend getaways near Playa del Carmen',
      'colonial style home in historic center with original features'
    ]
  }
];

/**
 * Run vector search test
 */
async function runTest(query, testName) {
  try {
    console.log(`\n🔍 Testing: "${query}"`);
    
    const response = await axios.post(`${API_URL}/api/vector-search/semantic`, {
      query,
      limit: 5
    });

    const { properties, search_insights, interpreted_filters } = response.data;
    
    console.log(`✅ Found ${properties.length} properties`);
    
    if (interpreted_filters && Object.keys(interpreted_filters).length > 0) {
      console.log(`📊 Interpreted filters:`, interpreted_filters);
    }
    
    if (properties.length > 0) {
      console.log(`🏠 Top matches:`);
      properties.slice(0, 3).forEach((prop, index) => {
        console.log(`   ${index + 1}. ${prop.title || prop.property_type} in ${prop.city}, ${prop.state}`);
        console.log(`      Score: ${prop.relevance_score.toFixed(3)}`);
        console.log(`      Price: $${prop.price?.toLocaleString() || 'N/A'} MXN`);
        if (prop.match_reason) {
          console.log(`      Match: ${prop.match_reason}`);
        }
      });
    }
    
    if (search_insights) {
      console.log(`💡 Insights:`, search_insights.message);
    }
    
    return { success: true, count: properties.length };
  } catch (error) {
    console.error(`❌ Error testing "${query}":`, error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Vector Search Tests\n');
  console.log('Testing semantic search with synonyms, fuzzy queries, and natural language...\n');
  
  const results = {
    total: 0,
    successful: 0,
    failed: 0,
    queries: []
  };

  for (const testCase of testQueries) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 ${testCase.name}`);
    console.log(`${'='.repeat(60)}`);
    
    for (const query of testCase.queries) {
      const result = await runTest(query, testCase.name);
      results.total++;
      
      if (result.success) {
        results.successful++;
        results.queries.push({
          query,
          test: testCase.name,
          matches: result.count,
          status: 'success'
        });
      } else {
        results.failed++;
        results.queries.push({
          query,
          test: testCase.name,
          error: result.error,
          status: 'failed'
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Test Summary');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total queries tested: ${results.total}`);
  console.log(`✅ Successful: ${results.successful}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success rate: ${((results.successful / results.total) * 100).toFixed(1)}%`);
  
  // Show failed queries
  const failedQueries = results.queries.filter(q => q.status === 'failed');
  if (failedQueries.length > 0) {
    console.log('\n❌ Failed queries:');
    failedQueries.forEach(q => {
      console.log(`   - "${q.query}" (${q.test}): ${q.error}`);
    });
  }
  
  // Show queries with no results
  const noResults = results.queries.filter(q => q.status === 'success' && q.matches === 0);
  if (noResults.length > 0) {
    console.log('\n⚠️  Queries with no results:');
    noResults.forEach(q => {
      console.log(`   - "${q.query}" (${q.test})`);
    });
  }
}

// Command line interface
if (process.argv.includes('--help')) {
  console.log(`
Vector Search Test Script

This script tests the vector search functionality with various queries
including synonyms, misspellings, and natural language variations.

Usage:
  node testVectorSearch.js [options]

Options:
  --help     Show this help message
  --single   Test a single query (provide as next argument)

Examples:
  node testVectorSearch.js                    # Run all tests
  node testVectorSearch.js --single "casa en Polanco"  # Test single query
  `);
  process.exit(0);
}

if (process.argv.includes('--single')) {
  const queryIndex = process.argv.indexOf('--single') + 1;
  const query = process.argv[queryIndex];
  
  if (!query) {
    console.error('Please provide a query after --single');
    process.exit(1);
  }
  
  runTest(query, 'Single Query Test').then(() => process.exit(0));
} else {
  // Check if backend is running
  axios.get(`${API_URL}/health`)
    .then(() => {
      console.log('✅ Backend server is running');
      return runAllTests();
    })
    .catch(() => {
      console.error('❌ Backend server is not running. Please start it first with: npm run dev');
      process.exit(1);
    })
    .then(() => process.exit(0));
}