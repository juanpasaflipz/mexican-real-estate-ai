const express = require('express')
const router = express.Router()

// In-memory storage for demo (use a real database in production)
let savedQueries = []

// Get all saved queries
router.get('/', (req, res) => {
  res.json(savedQueries)
})

// Save a new query
router.post('/', (req, res) => {
  const { name, description, naturalLanguageQuery, sqlQuery, category, isFavorite } = req.body
  
  if (!name || !naturalLanguageQuery || !sqlQuery) {
    return res.status(400).json({ 
      error: 'Name, naturalLanguageQuery, and sqlQuery are required' 
    })
  }

  const newQuery = {
    id: Date.now().toString(),
    name,
    description: description || '',
    naturalLanguageQuery,
    sqlQuery,
    category: category || 'general',
    isFavorite: isFavorite || false,
    createdAt: new Date(),
    lastUsed: null
  }

  savedQueries.push(newQuery)
  res.status(201).json(newQuery)
})

// Update a query
router.patch('/:id', (req, res) => {
  const { id } = req.params
  const queryIndex = savedQueries.findIndex(q => q.id === id)
  
  if (queryIndex === -1) {
    return res.status(404).json({ error: 'Query not found' })
  }

  const updates = req.body
  savedQueries[queryIndex] = {
    ...savedQueries[queryIndex],
    ...updates,
    id: savedQueries[queryIndex].id, // Prevent ID changes
    createdAt: savedQueries[queryIndex].createdAt // Preserve creation date
  }

  // Update lastUsed if query was executed
  if (updates.executed) {
    savedQueries[queryIndex].lastUsed = new Date()
  }

  res.json(savedQueries[queryIndex])
})

// Delete a query
router.delete('/:id', (req, res) => {
  const { id } = req.params
  const queryIndex = savedQueries.findIndex(q => q.id === id)
  
  if (queryIndex === -1) {
    return res.status(404).json({ error: 'Query not found' })
  }

  savedQueries.splice(queryIndex, 1)
  res.status(204).send()
})

// Get favorite queries
router.get('/favorites', (req, res) => {
  const favorites = savedQueries.filter(q => q.isFavorite)
  res.json(favorites)
})

// Get queries by category
router.get('/category/:category', (req, res) => {
  const { category } = req.params
  const filtered = savedQueries.filter(q => q.category === category)
  res.json(filtered)
})

module.exports = router