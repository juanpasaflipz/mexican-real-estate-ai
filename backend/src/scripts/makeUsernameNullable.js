const pool = require('../config/database');

async function makeUsernameNullable() {
  try {
    console.log('Starting username column modification...');
    
    // Check if username column exists and its current state
    const columnCheck = await pool.query(`
      SELECT column_name, is_nullable, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'username'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('Username column does not exist in users table.');
      return;
    }
    
    const column = columnCheck.rows[0];
    console.log(`Username column exists:`, column);
    
    if (column.is_nullable === 'YES') {
      console.log('Username column is already nullable. No changes needed.');
      return;
    }
    
    // Make username column nullable
    console.log('Making username column nullable...');
    await pool.query('ALTER TABLE users ALTER COLUMN username DROP NOT NULL');
    console.log('Username column is now nullable.');
    
    // Optionally, you can also add a unique constraint if it doesn't exist
    // This ensures that when a username is provided, it must be unique
    const constraintCheck = await pool.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
      AND table_name = 'users'
      AND constraint_type = 'UNIQUE'
      AND constraint_name LIKE '%username%'
    `);
    
    if (constraintCheck.rows.length === 0) {
      console.log('Adding unique constraint to username column...');
      await pool.query('ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username)');
      console.log('Unique constraint added.');
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
makeUsernameNullable().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});