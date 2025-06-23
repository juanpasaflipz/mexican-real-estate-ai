const express = require('express')
const router = express.Router()
const nlpService = require('../services/nlpService')

// Execute natural language query
router.post('/query', async (req, res, next) => {
  try {
    const { query } = req.body
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query is required and must be a string'
      })
    }

    const result = await nlpService.processQuery(query)
    
    // Transform response for frontend compatibility
    // If the route is accessed via /chat-ai, use a different format
    if (req.baseUrl.includes('chat-ai')) {
      res.json({
        ...result,
        // Send the summary as a plain string for the frontend
        analysis: result.analysis?.summary || 'No analysis available',
        // Keep the original analysis object as a separate field
        fullAnalysis: result.analysis
      })
    } else {
      res.json(result)
    }
  } catch (error) {
    console.error('Query processing error:', error)
    res.status(500).json({
      error: error.message || 'Failed to process query',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Get query suggestions
router.get('/suggestions', async (req, res, next) => {
  try {
    const { q } = req.query
    
    if (!q || typeof q !== 'string') {
      return res.json([])
    }

    const suggestions = await nlpService.getSuggestions(q)
    res.json(suggestions)
  } catch (error) {
    console.error('Suggestions error:', error)
    res.json([])
  }
})

// Get query templates
router.get('/templates', async (req, res, next) => {
  try {
    const { category } = req.query
    
    const templates = [
      {
        id: '1',
        name: 'User Growth Analysis',
        description: 'Analyze user signup trends',
        naturalLanguageQuery: 'Show me user growth over the last 30 days',
        sqlQuery: nlpService.queryTemplates.userQueries['user growth'],
        category: 'analytics',
        isFavorite: true,
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Database Health Check',
        description: 'Check database performance and size',
        naturalLanguageQuery: 'Show me database performance metrics',
        sqlQuery: nlpService.queryTemplates.performanceQueries['database size'],
        category: 'monitoring',
        isFavorite: true,
        createdAt: new Date()
      },
      {
        id: '3',
        name: 'Recent Activity',
        description: 'View recent system activity',
        naturalLanguageQuery: 'Show me recent activity',
        sqlQuery: 'SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 50',
        category: 'activity',
        isFavorite: false,
        createdAt: new Date()
      }
    ]

    const filtered = category 
      ? templates.filter(t => t.category === category)
      : templates

    res.json(filtered)
  } catch (error) {
    console.error('Templates error:', error)
    res.status(500).json({ error: 'Failed to fetch templates' })
  }
})

module.exports = router