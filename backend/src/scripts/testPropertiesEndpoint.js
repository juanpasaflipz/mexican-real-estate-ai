const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testPropertiesEndpoint() {
  try {
    console.log('Testing /api/properties endpoint...\n');
    
    // Test 1: Basic request
    const response1 = await axios.get(`${API_URL}/properties?limit=2`);
    console.log('Response structure:', {
      success: response1.data.success,
      hasData: !!response1.data.data,
      hasProperties: !!response1.data.data?.properties,
      isPropertiesArray: Array.isArray(response1.data.data?.properties),
      propertiesCount: response1.data.data?.properties?.length
    });
    
    // Test 2: Test with filters
    const response2 = await axios.get(`${API_URL}/properties?city=Monterrey&limit=2`);
    console.log('\nWith city filter (Monterrey):', {
      propertiesCount: response2.data.data?.properties?.length,
      firstProperty: response2.data.data?.properties?.[0]?.city
    });
    
    // Test 3: Test similar properties endpoint
    const propertyId = response1.data.data?.properties?.[0]?.id;
    if (propertyId) {
      const response3 = await axios.get(`${API_URL}/properties/${propertyId}/similar`);
      console.log('\nSimilar properties response:', {
        success: response3.data.success,
        hasData: !!response3.data.data,
        isDataArray: Array.isArray(response3.data.data),
        count: Array.isArray(response3.data.data) ? response3.data.data.length : 'not an array'
      });
    }
    
    // Test 4: Test property detail
    if (propertyId) {
      const response4 = await axios.get(`${API_URL}/properties/${propertyId}`);
      console.log('\nProperty detail response:', {
        success: response4.data.success,
        hasData: !!response4.data.data,
        propertyId: response4.data.data?.id
      });
    }
    
  } catch (error) {
    console.error('Error testing properties endpoint:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testPropertiesEndpoint();