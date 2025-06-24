const { Pool } = require('pg')

// Parse the connection string to handle IPv6 issues
function createPool() {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL
  
  // For Render deployment, we need to ensure IPv4 connectivity
  const config = {
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased timeout
  }

  // If we're on Render, try to force IPv4
  if (process.env.RENDER) {
    // Parse the connection string
    const url = new URL(connectionString)
    
    // Use the hostname directly (this often helps with IPv6 issues)
    config.host = url.hostname
    config.port = url.port || 5432
    config.user = url.username
    config.password = url.password
    config.database = url.pathname.slice(1)
    
    delete config.connectionString
  }

  return new Pool(config)
}

const pool = createPool()

// Test the connection
pool.on('connect', () => {
  console.log('Database connected successfully')
})

pool.on('error', (err) => {
  console.error('Database connection error:', err.message)
})

module.exports = pool