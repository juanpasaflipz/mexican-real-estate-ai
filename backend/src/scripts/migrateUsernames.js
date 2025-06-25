require('dotenv').config();
const pool = require('../config/database');

async function migrateUsernames() {
  try {
    console.log('Starting username migration...');
    
    // First, check if username column exists
    const columnCheck = await pool.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'username'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('Username column does not exist in users table. No migration needed.');
      return;
    }
    
    const isNullable = columnCheck.rows[0].is_nullable === 'YES';
    console.log(`Username column exists. Is nullable: ${isNullable}`);
    
    // Option 1: Make username nullable (uncomment if you want this approach)
    // if (!isNullable) {
    //   console.log('Making username column nullable...');
    //   await pool.query('ALTER TABLE users ALTER COLUMN username DROP NOT NULL');
    //   console.log('Username column is now nullable.');
    // }
    
    // Option 2: Generate usernames for existing users without them
    console.log('Checking for users without usernames...');
    const usersWithoutUsername = await pool.query(
      'SELECT id, email, name, google_id FROM users WHERE username IS NULL OR username = \'\''
    );
    
    console.log(`Found ${usersWithoutUsername.rows.length} users without usernames`);
    
    for (const user of usersWithoutUsername.rows) {
      let username = '';
      
      // Generate username from email
      if (user.email) {
        const emailParts = user.email.split('@');
        username = emailParts[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      } else if (user.name) {
        // Fallback to name
        username = user.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      } else if (user.google_id) {
        // Last resort: use Google ID
        username = `user${user.google_id.slice(0, 8)}`;
      } else {
        // Ultimate fallback
        username = `user${user.id.slice(0, 8)}`;
      }
      
      // Ensure username is unique
      let finalUsername = username;
      let suffix = 1;
      let isUnique = false;
      
      while (!isUnique) {
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE username = $1 AND id != $2',
          [finalUsername, user.id]
        );
        
        if (existingUser.rows.length === 0) {
          isUnique = true;
        } else {
          finalUsername = `${username}${suffix}`;
          suffix++;
        }
      }
      
      // Update user with generated username
      await pool.query(
        'UPDATE users SET username = $1 WHERE id = $2',
        [finalUsername, user.id]
      );
      
      console.log(`Updated user ${user.id} with username: ${finalUsername}`);
    }
    
    console.log('Username migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
migrateUsernames().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});