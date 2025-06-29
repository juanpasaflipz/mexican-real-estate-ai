require('dotenv').config();
const axios = require('axios');

async function testGoogleGeocoding() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    console.log('❌ Please add your Google Maps API key to backend/.env file');
    console.log('   GOOGLE_MAPS_API_KEY=your_actual_key_here');
    process.exit(1);
  }
  
  console.log('🔍 Testing Google Maps Geocoding API...\n');
  
  // Test addresses
  const testAddresses = [
    'Polanco, Ciudad de México',
    'Roma Norte, Cuauhtémoc, CDMX',
    'Playa del Carmen, Quintana Roo',
    'San Miguel de Allende, Guanajuato',
    'Cerrada Costera De Las Palmas 91, Playa Diamante, Acapulco, Guerrero'
  ];
  
  for (const address of testAddresses) {
    try {
      console.log(`Testing: ${address}`);
      
      const url = 'https://maps.googleapis.com/maps/api/geocode/json';
      const response = await axios.get(url, {
        params: {
          address: address + ', Mexico',
          key: apiKey,
          region: 'mx'
        }
      });
      
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = result.geometry.location;
        console.log(`✅ Success! Lat: ${location.lat}, Lng: ${location.lng}`);
        console.log(`   Formatted: ${result.formatted_address}`);
      } else {
        console.log(`❌ No results found. Status: ${response.data.status}`);
        if (response.data.error_message) {
          console.log(`   Error: ${response.data.error_message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('✅ Test complete! If all tests passed, you can run:');
  console.log('   node src/scripts/geocodeFast.js');
}

testGoogleGeocoding();