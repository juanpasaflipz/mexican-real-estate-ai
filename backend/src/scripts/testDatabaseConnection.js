require('dotenv').config()
const { Pool } = require('pg')

async function testConnection() {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL
  console.log('Attempting to connect to database...')
  console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@'))
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
  })

  try {
    const result = await pool.query('SELECT NOW()')
    console.log('Connection successful! Current time:', result.rows[0].now)
    
    // Now test properties table
    const propTest = await pool.query('SELECT COUNT(*) FROM properties')
    console.log('Properties count:', propTest.rows[0].count)
    
  } catch (error) {
    console.error('Connection error:', error.message)
    console.error('Error code:', error.code)
    if (error.code === 'ENOTFOUND') {
      console.error('DNS resolution failed. This might be a network issue.')
    }
  } finally {
    await pool.end()
  }
}

testConnection()