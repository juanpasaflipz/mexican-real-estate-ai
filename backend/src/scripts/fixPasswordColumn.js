require('dotenv').config();
const pool = require('../config/database');

async function fixPasswordColumn() {
  try {
    console.log('Checking password column constraint...');
    
    // First, check if the password column exists and its constraints
    const columnInfo = await pool.query(`
      SELECT column_name, is_nullable, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'password';
    `);

    if (columnInfo.rows.length === 0) {
      console.log('No password column found in users table.');
      return;
    }

    const passwordColumn = columnInfo.rows[0];
    console.log('Current password column info:', passwordColumn);

    if (passwordColumn.is_nullable === 'NO') {
      console.log('Password column is NOT NULL, making it nullable for OAuth users...');
      
      // Make password column nullable
      await pool.query(`
        ALTER TABLE users 
        ALTER COLUMN password DROP NOT NULL;
      `);
      
      console.log('✅ Password column is now nullable');
      
      // Update any existing OAuth users that might have dummy passwords
      const result = await pool.query(`
        UPDATE users 
        SET password = NULL 
        WHERE google_id IS NOT NULL 
        AND password LIKE 'oauth_user_%'
        RETURNING id, email;
      `);
      
      if (result.rows.length > 0) {
        console.log(`✅ Updated ${result.rows.length} OAuth users to have NULL passwords`);
      }
    } else {
      console.log('✅ Password column is already nullable');
    }

    // Add a check constraint to ensure users have either a password or google_id
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD CONSTRAINT users_auth_check 
        CHECK (password IS NOT NULL OR google_id IS NOT NULL);
      `);
      console.log('✅ Added constraint to ensure users have either password or google_id');
    } catch (err) {
      if (err.code === '42710') { // Constraint already exists
        console.log('✅ Auth check constraint already exists');
      } else {
        console.error('Note: Could not add auth check constraint:', err.message);
      }
    }

  } catch (error) {
    console.error('Error fixing password column:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the fix
fixPasswordColumn()
  .then(() => {
    console.log('\n🎉 Password column fix completed successfully!');
    console.log('OAuth users can now be created without passwords.');
  })
  .catch((error) => {
    console.error('\n❌ Failed to fix password column:', error);
    process.exit(1);
  });