require('dotenv').config();
const pool = require('../config/database');

async function debugAuth() {
  console.log('\n=== Authentication Debug Information ===\n');
  
  // Check environment variables
  console.log('1. Environment Variables:');
  console.log('   - NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('   - GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Not set');
  console.log('   - GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Not set');
  console.log('   - CLIENT_URL:', process.env.CLIENT_URL || 'Not set (defaults to http://localhost:5173)');
  console.log('   - API_URL:', process.env.API_URL || 'Not set');
  console.log('   - JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Not set');
  
  // Calculate callback URL
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? process.env.API_URL 
    : 'http://localhost:3001';
  const callbackURL = `${apiUrl}/api/auth/google/callback`;
  
  console.log('\n2. OAuth Configuration:');
  console.log('   - Callback URL:', callbackURL);
  console.log('   - Frontend URL:', process.env.CLIENT_URL || 'http://localhost:5173');
  
  // Check database tables
  try {
    console.log('\n3. Database Tables:');
    
    // Check users table
    const usersCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    console.log('   - users table:', usersCheck.rows[0].exists ? '✓ Exists' : '✗ Not found');
    
    // Check app_users table
    const appUsersCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'app_users'
      );
    `);
    console.log('   - app_users table:', appUsersCheck.rows[0].exists ? '✓ Exists' : '✗ Not found');
    
    // Check user_sessions table
    const sessionsCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_sessions'
      );
    `);
    console.log('   - user_sessions table:', sessionsCheck.rows[0].exists ? '✓ Exists' : '✗ Not found');
    
    // Check columns in users table
    if (usersCheck.rows[0].exists) {
      const columnsResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
        AND column_name IN ('id', 'email', 'name', 'username', 'google_id', 'password', 'role')
        ORDER BY ordinal_position;
      `);
      
      console.log('\n4. Users Table Columns:');
      columnsResult.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }
    
    // Count users
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const appUserCount = await pool.query('SELECT COUNT(*) FROM app_users');
    
    console.log('\n5. User Statistics:');
    console.log('   - Total users:', userCount.rows[0].count);
    console.log('   - Total app_users:', appUserCount.rows[0].count);
    
  } catch (error) {
    console.error('\nDatabase Error:', error.message);
  }
  
  console.log('\n6. Google OAuth Setup Instructions:');
  console.log('   1. Go to https://console.cloud.google.com/apis/credentials');
  console.log('   2. Click on your OAuth 2.0 Client ID');
  console.log('   3. Add these Authorized redirect URIs:');
  console.log('      - http://localhost:3001/api/auth/google/callback');
  console.log('      - https://mexican-real-estate-ai.onrender.com/api/auth/google/callback');
  console.log('   4. Save the changes');
  
  console.log('\n7. Testing Authentication:');
  console.log('   - Local test URL: http://localhost:3001/api/auth/google');
  console.log('   - This should redirect to Google OAuth consent screen');
  
  console.log('\n=== End Debug Information ===\n');
  
  process.exit(0);
}

debugAuth().catch(console.error);