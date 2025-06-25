require('dotenv').config();
const pool = require('../config/database');

async function createUserTables() {
  try {
    // Create user roles enum
    await pool.query(`
      CREATE TYPE user_role AS ENUM ('admin', 'broker', 'subscriber', 'user');
    `).catch(err => {
      if (err.code !== '42710') { // Type already exists
        throw err;
      }
    });

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        google_id VARCHAR(255) UNIQUE,
        avatar_url TEXT,
        role user_role DEFAULT 'user',
        phone VARCHAR(20),
        
        -- Broker specific fields
        agency_name VARCHAR(255),
        license_number VARCHAR(100),
        bio TEXT,
        verified_broker BOOLEAN DEFAULT FALSE,
        
        -- Subscription fields
        subscription_tier VARCHAR(50), -- 'basic', 'premium', 'professional'
        subscription_expires_at TIMESTAMP WITH TIME ZONE,
        
        -- Metadata
        last_login_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);

    // Create saved searches table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_searches (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255),
        search_criteria JSONB NOT NULL,
        alert_enabled BOOLEAN DEFAULT FALSE,
        alert_frequency VARCHAR(50) DEFAULT 'daily', -- 'immediate', 'daily', 'weekly'
        last_alert_sent_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create favorite properties table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorite_properties (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, property_id)
      );
    `);

    // Create user sessions table for JWT refresh tokens
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        refresh_token TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(refresh_token)
      );
    `);

    // Create property inquiries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_inquiries (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        broker_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'contacted', 'closed'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('✅ User tables created successfully');
    
    // Create sample admin user
    await pool.query(`
      INSERT INTO users (email, name, role) 
      VALUES ('admin@mexrealestate.com', 'Admin User', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `);
    
    console.log('✅ Sample admin user created (admin@mexrealestate.com)');

  } catch (error) {
    console.error('Error creating user tables:', error);
  } finally {
    await pool.end();
  }
}

createUserTables();