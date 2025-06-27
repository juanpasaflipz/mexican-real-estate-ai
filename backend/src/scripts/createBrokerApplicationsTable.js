require('dotenv').config();
const pool = require('../config/database');

async function createBrokerApplicationsTable() {
  try {
    console.log('Creating broker applications table...');

    // Create broker application status enum
    await pool.query(`
      CREATE TYPE broker_application_status AS ENUM ('pending', 'approved', 'rejected');
    `).catch(err => {
      if (err.code === '42710') { // Type already exists
        console.log('Broker application status type already exists');
      } else {
        throw err;
      }
    });

    // Create broker_applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS broker_applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        
        -- Application data
        license_number VARCHAR(100) NOT NULL,
        brokerage_name VARCHAR(255),
        years_experience VARCHAR(20) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        specializations TEXT[],
        about_me TEXT,
        documents TEXT[], -- Array of file paths
        
        -- Review data
        status broker_application_status DEFAULT 'pending',
        submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        reviewed_by INTEGER REFERENCES app_users(id),
        review_note TEXT,
        
        -- Metadata
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('✅ broker_applications table created');

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_broker_applications_user_id ON broker_applications(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_broker_applications_status ON broker_applications(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_broker_applications_submitted_at ON broker_applications(submitted_at DESC);`);

    console.log('✅ Indexes created successfully');

    // Create uploads directory for broker documents
    const fs = require('fs').promises;
    const path = require('path');
    const uploadsDir = path.join(__dirname, '../../uploads/broker-applications');
    
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      console.log('✅ Uploads directory created at:', uploadsDir);
    } catch (error) {
      console.log('Uploads directory may already exist:', error.message);
    }

    console.log('✅ Broker applications table setup completed successfully');

  } catch (error) {
    console.error('Error creating broker applications table:', error);
  } finally {
    await pool.end();
  }
}

createBrokerApplicationsTable();