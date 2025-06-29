require('dotenv').config()
const { Pool } = require('pg')

async function testConnection() {
  console.log('Testing database connection...')
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
  
  // Create a new pool with SSL and timeout settings
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000, // 10 seconds
    query_timeout: 10000,
    statement_timeout: 10000
  })
  
  try {
    console.log('Attempting to connect...')
    const client = await pool.connect()
    console.log('✓ Successfully connected to database!')
    
    // Test query
    const result = await client.query('SELECT NOW()')
    console.log('✓ Database time:', result.rows[0].now)
    
    // Check properties table
    const propCheck = await client.query(`
      SELECT COUNT(*) as count FROM properties
    `)
    console.log('✓ Properties table has', propCheck.rows[0].count, 'records')
    
    // Check if lat/lng columns exist
    const colCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'properties' 
      AND column_name IN ('lat', 'lng')
    `)
    console.log('✓ Found columns:', colCheck.rows.map(r => r.column_name).join(', ') || 'none')
    
    client.release()
    console.log('\n✅ Database connection successful!')
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message)
    
    if (error.message.includes('timeout')) {
      console.log('\nPossible issues:')
      console.log('1. Check if your IP is whitelisted in Supabase')
      console.log('2. Check if the database is active (not paused)')
      console.log('3. Try accessing Supabase dashboard to wake up the database')
    }
  } finally {
    await pool.end()
  }
}

testConnection()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))