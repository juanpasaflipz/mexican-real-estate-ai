const { Pool } = require('pg')
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function publishDraftPost() {
  try {
    // Get the first draft post
    const draftQuery = 'SELECT id, title FROM blog_posts WHERE status = $1 LIMIT 1'
    const draftResult = await pool.query(draftQuery, ['draft'])
    
    if (draftResult.rows.length === 0) {
      console.log('No draft posts found')
      return
    }
    
    const post = draftResult.rows[0]
    console.log(`Publishing post: ${post.title}`)
    
    // Update status to published
    const updateQuery = `
      UPDATE blog_posts 
      SET status = 'published', 
          published_at = NOW() 
      WHERE id = $1
      RETURNING slug
    `
    const updateResult = await pool.query(updateQuery, [post.id])
    
    console.log(`✅ Post published successfully!`)
    console.log(`View it at: http://localhost:5173/blog/${updateResult.rows[0].slug}`)
    
  } catch (error) {
    console.error('Error publishing post:', error)
  } finally {
    await pool.end()
  }
}

publishDraftPost()