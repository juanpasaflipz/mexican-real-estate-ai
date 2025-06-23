const { Pool } = require('pg')

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
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