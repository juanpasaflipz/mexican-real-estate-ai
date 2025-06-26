const { Pool } = require('pg')

// Create a connection pool optimized for long-running operations
const vectorPool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_POOLER_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 3, // Even fewer connections for pooler
  idleTimeoutMillis: 600000, // 10 minutes idle timeout
  connectionTimeoutMillis: 60000, // 60 seconds connection timeout
  query_timeout: 300000, // 5 minutes query timeout
  statement_timeout: 300000, // 5 minutes statement timeout
})

// Test the connection
vectorPool.on('connect', () => {
  console.log('Vector database connected successfully')
})

vectorPool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err)
})

// Export the pool for use in other modules
module.exports = vectorPool