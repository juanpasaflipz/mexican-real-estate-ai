const { Pool } = require('pg')

// Create a connection pool
// Supabase requires SSL
const isSupabase = (process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || '').includes('supabase.co')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
  ssl: isSupabase ? {
    rejectUnauthorized: false,
    require: true
  } : false,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 20000, // Increased to 20 seconds for Supabase
})

// Test the connection
pool.on('connect', () => {
  console.log('Database connected successfully')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err)
})

// Export the pool for use in other modules
module.exports = pool