require('dotenv').config();
const pool = require('../config/database');

async function createPropertyViewsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_views (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        user_id INTEGER,
        ip_address VARCHAR(45),
        user_agent TEXT,
        referrer TEXT,
        viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
      CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON property_views(viewed_at);
      CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON property_views(user_id);
    `);

    // Add view_count column to properties table if it doesn't exist
    await pool.query(`
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
    `);

    console.log('✅ Property views table created successfully');
  } catch (error) {
    console.error('Error creating property views table:', error);
  } finally {
    await pool.end();
  }
}

createPropertyViewsTable();