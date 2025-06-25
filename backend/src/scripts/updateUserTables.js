require('dotenv').config();
const pool = require('../config/database');

async function updateUserTables() {
  try {
    // Check if users table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('Users table does not exist, creating it...');
      
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
        CREATE TABLE users (
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
          subscription_tier VARCHAR(50),
          subscription_expires_at TIMESTAMP WITH TIME ZONE,
          
          -- Metadata
          last_login_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    } else {
      console.log('Users table exists, checking for missing columns...');
      
      // Add missing columns if they don't exist
      const alterQueries = [
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_name VARCHAR(255)`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number VARCHAR(100)`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_broker BOOLEAN DEFAULT FALSE`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50)`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE`,
      ];

      for (const query of alterQueries) {
        await pool.query(query);
      }

      // Check if role column exists and is the correct type
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user'`);
      } catch (err) {
        if (err.code === '42710') { // Type doesn't exist
          await pool.query(`CREATE TYPE user_role AS ENUM ('admin', 'broker', 'subscriber', 'user')`);
          await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user'`);
        }
      }
    }

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`).catch(err => {
      console.log('Note: Could not create role index, column might not exist yet');
    });

    // Create other tables
    console.log('Creating related tables...');

    // Saved searches
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_searches (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255),
        search_criteria JSONB NOT NULL,
        alert_enabled BOOLEAN DEFAULT FALSE,
        alert_frequency VARCHAR(50) DEFAULT 'daily',
        last_alert_sent_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Favorite properties
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

    // User sessions
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

    // Property inquiries
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
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('✅ All user tables created/updated successfully');
    
    // Create sample admin user
    await pool.query(`
      INSERT INTO users (email, name, role) 
      VALUES ('admin@mexrealestate.com', 'Admin User', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `);
    
    console.log('✅ Sample admin user created (admin@mexrealestate.com)');

  } catch (error) {
    console.error('Error updating user tables:', error);
  } finally {
    await pool.end();
  }
}

updateUserTables();