require('dotenv').config();

console.log('\n=== Testing OAuth Flow ===\n');

// Check if server is running
const axios = require('axios');
const baseUrl = 'http://localhost:3001';

async function testAuthFlow() {
  try {
    // Test if server is running
    console.log('1. Testing server connection...');
    const healthCheck = await axios.get(`${baseUrl}/health`).catch(() => null);
    if (!healthCheck) {
      console.log('   ✗ Server is not running. Start it with: npm run dev');
      return;
    }
    console.log('   ✓ Server is running');
    
    // Test Google OAuth endpoint
    console.log('\n2. Testing Google OAuth endpoint...');
    const authResponse = await axios.get(`${baseUrl}/api/auth/google`, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    }).catch(err => err.response);
    
    if (authResponse && authResponse.status === 302) {
      console.log('   ✓ OAuth endpoint is working (returns 302 redirect)');
      console.log('   - Redirect URL:', authResponse.headers.location);
      
      // Check if it's redirecting to Google
      if (authResponse.headers.location && authResponse.headers.location.includes('accounts.google.com')) {
        console.log('   ✓ Correctly redirecting to Google OAuth');
      } else {
        console.log('   ✗ Not redirecting to Google OAuth');
      }
    } else {
      console.log('   ✗ OAuth endpoint not working properly');
    }
    
    console.log('\n3. OAuth URLs to test manually:');
    console.log('   - Local: http://localhost:3001/api/auth/google');
    console.log('   - Production: https://mexican-real-estate-ai.onrender.com/api/auth/google');
    
    console.log('\n4. Frontend login page:');
    console.log('   - Local: http://localhost:5173/login');
    console.log('   - Production: https://mexican-real-estate-ai-jy2t.vercel.app/login');
    
    console.log('\n5. Common issues and solutions:');
    console.log('   - "Error al iniciar sesión" usually means:');
    console.log('     • Google OAuth redirect URIs not configured properly');
    console.log('     • Database tables missing (now fixed)');
    console.log('     • JWT_SECRET not set in environment');
    console.log('     • Google OAuth credentials invalid');
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testAuthFlow();