const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function initializeBlogDatabase() {
  try {
    console.log('Initializing blog database schema...')
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../database/schema/blog-schema.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute the schema
    await pool.query(schemaSql)
    
    console.log('✅ Blog database schema created successfully!')
    
    // Verify tables were created
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'blog_%'
      ORDER BY table_name
    `
    
    const result = await pool.query(tablesQuery)
    console.log('\nCreated tables:')
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })
    
    // Check if categories were inserted
    const categoriesResult = await pool.query('SELECT COUNT(*) as count FROM blog_categories')
    console.log(`\n✅ Inserted ${categoriesResult.rows[0].count} blog categories`)
    
    // Check if templates were inserted
    const templatesResult = await pool.query('SELECT COUNT(*) as count FROM blog_templates')
    console.log(`✅ Inserted ${templatesResult.rows[0].count} blog templates`)
    
  } catch (error) {
    console.error('❌ Error initializing blog database:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run the initialization
initializeBlogDatabase()
  .then(() => {
    console.log('\n🎉 Blog database initialization complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Blog database initialization failed:', error)
    process.exit(1)
  })