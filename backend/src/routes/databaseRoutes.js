const express = require('express')
const router = express.Router()
const { Pool } = require('pg')
const nlpService = require('../services/nlpService')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// Get database schema
router.get('/schema', async (req, res, next) => {
  try {
    const schema = await nlpService.getSchema()
    res.json(schema)
  } catch (error) {
    console.error('Schema fetch error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch database schema',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Get table preview
router.get('/tables/:tableName/preview', async (req, res, next) => {
  try {
    const { tableName } = req.params
    const { limit = 10 } = req.query
    
    // Validate table name to prevent SQL injection
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return res.status(400).json({ error: 'Invalid table name' })
    }

    const query = `SELECT * FROM ${tableName} LIMIT $1`
    const result = await pool.query(query, [parseInt(limit)])

    res.json({
      data: result.rows,
      columns: result.fields.map(field => ({
        name: field.name,
        type: field.dataTypeID,
        nullable: true
      })),
      rowCount: result.rowCount,
      executionTime: 0
    })
  } catch (error) {
    console.error('Table preview error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch table preview',
      details: error.message
    })
  }
})

// Get database statistics
router.get('/stats', async (req, res, next) => {
  try {
    const stats = {}

    // Database size
    const sizeResult = await pool.query(`
      SELECT pg_database_size(current_database()) as size,
             pg_size_pretty(pg_database_size(current_database())) as size_pretty
    `)
    stats.databaseSize = sizeResult.rows[0].size_pretty

    // Table count
    const tableCountResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_type = 'BASE TABLE'
    `)
    stats.tableCount = parseInt(tableCountResult.rows[0].count)

    // Active connections
    const connectionsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM pg_stat_activity 
      WHERE state = 'active'
    `)
    stats.activeQueries = parseInt(connectionsResult.rows[0].count)

    // Total records (approximate)
    const recordsResult = await pool.query(`
      SELECT SUM(n_live_tup) as total
      FROM pg_stat_user_tables
    `)
    stats.totalRecords = parseInt(recordsResult.rows[0].total || 0)

    res.json(stats)
  } catch (error) {
    console.error('Stats fetch error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch database statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Get table statistics
router.get('/tables/:tableName/stats', async (req, res, next) => {
  try {
    const { tableName } = req.params
    
    // Validate table name
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return res.status(400).json({ error: 'Invalid table name' })
    }

    const stats = {}

    // Row count
    const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`)
    stats.rowCount = parseInt(countResult.rows[0].count)

    // Table size
    const sizeResult = await pool.query(`
      SELECT pg_size_pretty(pg_total_relation_size($1)) as size
    `, [tableName])
    stats.size = sizeResult.rows[0].size

    // Column statistics
    const columnsResult = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName])
    stats.columns = columnsResult.rows

    res.json(stats)
  } catch (error) {
    console.error('Table stats error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch table statistics',
      details: error.message
    })
  }
})

module.exports = router