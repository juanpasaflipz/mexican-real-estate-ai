require('dotenv').config();
const pool = require('../config/database');

async function createAppUserTables() {
  try {
    console.log('Creating application user tables...');

    // Create user roles enum
    await pool.query(`
      CREATE TYPE user_role AS ENUM ('admin', 'broker', 'subscriber', 'user');
    `).catch(err => {
      if (err.code === '42710') { // Type already exists
        console.log('User role type already exists');
      } else {
        throw err;
      }
    });

    // Create app_users table that references auth.users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id SERIAL PRIMARY KEY,
        auth_user_id UUID UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role user_role DEFAULT 'user',
        
        -- Broker specific fields
        agency_name VARCHAR(255),
        license_number VARCHAR(100),
        bio TEXT,
        verified_broker BOOLEAN DEFAULT FALSE,
        
        -- Subscription fields
        subscription_tier VARCHAR(50), -- 'basic', 'premium', 'professional'
        subscription_expires_at TIMESTAMP WITH TIME ZONE,
        
        -- Metadata
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('✅ app_users table created');

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_app_users_auth_user_id ON app_users(auth_user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users(role);`);

    // Create saved searches table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_searches (
        id SERIAL PRIMARY KEY,
        app_user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        name VARCHAR(255),
        search_criteria JSONB NOT NULL,
        alert_enabled BOOLEAN DEFAULT FALSE,
        alert_frequency VARCHAR(50) DEFAULT 'daily', -- 'immediate', 'daily', 'weekly'
        last_alert_sent_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('✅ saved_searches table created');

    // Create favorite properties table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorite_properties (
        id SERIAL PRIMARY KEY,
        app_user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(app_user_id, property_id)
      );
    `);

    console.log('✅ favorite_properties table created');

    // Create property inquiries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_inquiries (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        app_user_id INTEGER REFERENCES app_users(id) ON DELETE SET NULL,
        broker_id INTEGER REFERENCES app_users(id) ON DELETE SET NULL,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'contacted', 'closed'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('✅ property_inquiries table created');

    // Create broker properties table (for properties listed by brokers)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS broker_properties (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        broker_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        commission_percentage DECIMAL(5,2),
        listing_agreement_date DATE,
        listing_expiry_date DATE,
        exclusive_listing BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(property_id, broker_id)
      );
    `);

    console.log('✅ broker_properties table created');

    console.log('✅ All application user tables created successfully');

  } catch (error) {
    console.error('Error creating app user tables:', error);
  } finally {
    await pool.end();
  }
}

createAppUserTables();