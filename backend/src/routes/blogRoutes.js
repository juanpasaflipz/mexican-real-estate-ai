const express = require('express')
const router = express.Router()
const blogGenerationService = require('../services/blogGenerationService')
const { Pool } = require('pg')

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// Get all blog posts
router.get('/posts', async (req, res) => {
  try {
    const { 
      status = 'published', 
      category, 
      limit = 10, 
      offset = 0,
      sort = 'published_at DESC' 
    } = req.query
    
    let query = `
      SELECT 
        id, slug, title, title_es, summary, summary_es,
        featured_image_url, category, tags, 
        published_at, view_count, author_id,
        meta_title, meta_description
      FROM blog_posts 
      WHERE 1=1
    `
    const params = []
    let paramCount = 0
    
    if (status) {
      paramCount++
      query += ` AND status = $${paramCount}`
      params.push(status)
    }
    
    if (category) {
      paramCount++
      query += ` AND category = $${paramCount}`
      params.push(category)
    }
    
    // Add sorting and pagination
    query += ` ORDER BY ${sort} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    params.push(limit, offset)
    
    const result = await pool.query(query, params)
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM blog_posts 
      WHERE status = $1 ${category ? 'AND category = $2' : ''}
    `
    const countParams = [status]
    if (category) countParams.push(category)
    
    const countResult = await pool.query(countQuery, countParams)
    
    res.json({
      posts: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    res.status(500).json({ error: 'Failed to fetch blog posts' })
  }
})

// Get single blog post by slug
router.get('/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    
    // Get post
    const postQuery = `
      SELECT * FROM blog_posts 
      WHERE slug = $1 AND status = 'published'
    `
    const postResult = await pool.query(postQuery, [slug])
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' })
    }
    
    const post = postResult.rows[0]
    
    // Increment view count
    await pool.query(
      'UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1',
      [post.id]
    )
    
    // Log analytics event
    await pool.query(
      'INSERT INTO blog_analytics (blog_post_id, event_type, session_id) VALUES ($1, $2, $3)',
      [post.id, 'view', req.sessionID || req.ip]
    )
    
    // Get related properties if any
    // For now, skip the related properties query due to type mismatch
    // TODO: Fix property_id type in blog_post_properties table
    const propertiesResult = { rows: [] }
    
    res.json({
      ...post,
      related_properties: propertiesResult.rows
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    res.status(500).json({ error: 'Failed to fetch blog post' })
  }
})

// Get blog categories
router.get('/categories', async (req, res) => {
  try {
    const query = `
      SELECT c.*, COUNT(p.id) as post_count
      FROM blog_categories c
      LEFT JOIN blog_posts p ON p.category = c.slug AND p.status = 'published'
      GROUP BY c.id
      ORDER BY c.name
    `
    const result = await pool.query(query)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// Generate blog post (admin only - add auth middleware in production)
router.post('/generate', async (req, res) => {
  try {
    const { templateType, parameters = {} } = req.body
    
    if (!templateType) {
      return res.status(400).json({ error: 'Template type is required' })
    }
    
    // Generate blog post
    const blogPost = await blogGenerationService.generateBlogPost(templateType, parameters)
    
    res.json({
      message: 'Blog post generated successfully',
      post: blogPost
    })
  } catch (error) {
    console.error('Error generating blog post:', error)
    res.status(500).json({ error: error.message || 'Failed to generate blog post' })
  }
})

// Schedule blog generation
router.post('/schedule', async (req, res) => {
  try {
    const { templateType, parameters = {}, scheduledFor } = req.body
    
    if (!templateType || !scheduledFor) {
      return res.status(400).json({ 
        error: 'Template type and scheduled time are required' 
      })
    }
    
    const job = await blogGenerationService.scheduleGeneration(
      templateType,
      parameters,
      new Date(scheduledFor)
    )
    
    res.json({
      message: 'Blog generation scheduled',
      job
    })
  } catch (error) {
    console.error('Error scheduling blog generation:', error)
    res.status(500).json({ error: 'Failed to schedule blog generation' })
  }
})

// Get blog analytics
router.get('/analytics/:postId', async (req, res) => {
  try {
    const { postId } = req.params
    const { days = 30 } = req.query
    
    // Get view trends
    const viewsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as views
      FROM blog_analytics
      WHERE blog_post_id = $1 
      AND event_type = 'view'
      AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `
    const viewsResult = await pool.query(viewsQuery, [postId])
    
    // Get event breakdown
    const eventsQuery = `
      SELECT 
        event_type,
        COUNT(*) as count
      FROM blog_analytics
      WHERE blog_post_id = $1
      AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY event_type
    `
    const eventsResult = await pool.query(eventsQuery, [postId])
    
    res.json({
      views_by_day: viewsResult.rows,
      event_breakdown: eventsResult.rows
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

// Generate instant insights for a city
router.post('/generate/city-insights', async (req, res) => {
  try {
    const { city } = req.body
    
    if (!city) {
      return res.status(400).json({ error: 'City is required' })
    }
    
    const blogPost = await blogGenerationService.generateCityInsights(city)
    
    res.json({
      message: 'City insights generated successfully',
      post: blogPost
    })
  } catch (error) {
    console.error('Error generating city insights:', error)
    res.status(500).json({ error: 'Failed to generate city insights' })
  }
})

// Generate city comparison
router.post('/generate/city-comparison', async (req, res) => {
  try {
    const { city1, city2 } = req.body
    
    if (!city1 || !city2) {
      return res.status(400).json({ error: 'Both cities are required' })
    }
    
    const blogPost = await blogGenerationService.generateCityComparison(city1, city2)
    
    res.json({
      message: 'City comparison generated successfully',
      post: blogPost
    })
  } catch (error) {
    console.error('Error generating city comparison:', error)
    res.status(500).json({ error: 'Failed to generate city comparison' })
  }
})

// Process scheduled jobs (should be called by a cron job)
router.post('/process-scheduled', async (req, res) => {
  try {
    await blogGenerationService.processScheduledJobs()
    res.json({ message: 'Scheduled jobs processed' })
  } catch (error) {
    console.error('Error processing scheduled jobs:', error)
    res.status(500).json({ error: 'Failed to process scheduled jobs' })
  }
})

module.exports = router