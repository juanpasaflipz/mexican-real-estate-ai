require('dotenv').config();
const pool = require('../config/database');

async function createUserSessionsTable() {
  try {
    // Create user_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        refresh_token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✓ Created user_sessions table');
    
    // Create index on refresh_token for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token 
      ON user_sessions(refresh_token);
    `);
    
    console.log('✓ Created index on refresh_token');
    
    // Create index on user_id
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
      ON user_sessions(user_id);
    `);
    
    console.log('✓ Created index on user_id');
    
    // Verify table was created
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_sessions'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nuser_sessions table structure:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n✓ user_sessions table created successfully!');
    
  } catch (error) {
    console.error('Error creating user_sessions table:', error);
  } finally {
    process.exit(0);
  }
}

createUserSessionsTable();