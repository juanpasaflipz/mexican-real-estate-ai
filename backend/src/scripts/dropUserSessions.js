require('dotenv').config();
const pool = require('../config/database');

async function dropUserSessions() {
  try {
    // Drop the user_sessions table if it exists
    await pool.query('DROP TABLE IF EXISTS user_sessions CASCADE');
    console.log('✅ Dropped user_sessions table');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

dropUserSessions();