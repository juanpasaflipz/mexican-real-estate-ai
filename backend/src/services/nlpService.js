const { Pool } = require('pg')
const OpenAI = require('openai')

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// Initialize OpenAI (optional - for enhanced NLP)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

class NLPService {
  constructor() {
    this.queryTemplates = this.loadQueryTemplates()
    this.schemaCache = null
    this.schemaCacheTime = null
  }

  loadQueryTemplates() {
    return {
      userQueries: {
        'all users': 'SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 100',
        'recent users': 'SELECT * FROM auth.users WHERE created_at >= CURRENT_DATE - INTERVAL \'30 days\' ORDER BY created_at DESC',
        'user count': 'SELECT COUNT(*) as total_users FROM auth.users',
        'user growth': `
          SELECT 
            DATE_TRUNC('day', created_at) as date,
            COUNT(*) as new_users,
            SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', created_at)) as cumulative_users
          FROM auth.users
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY DATE_TRUNC('day', created_at)
          ORDER BY date DESC
        `
      },
      performanceQueries: {
        'database size': `
          SELECT 
            pg_database.datname,
            pg_size_pretty(pg_database_size(pg_database.datname)) AS size
          FROM pg_database
          WHERE datname = current_database()
        `,
        'table sizes': `
          SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
            pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
          FROM pg_tables
          WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
          ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
          LIMIT 10
        `,
        'slow queries': `
          SELECT 
            query,
            calls,
            total_exec_time,
            mean_exec_time,
            max_exec_time
          FROM pg_stat_statements
          WHERE query NOT LIKE '%pg_stat_statements%'
          ORDER BY mean_exec_time DESC
          LIMIT 10
        `
      }
    }
  }

  async getSchema() {
    // Cache schema for 5 minutes
    if (this.schemaCache && this.schemaCacheTime && 
        Date.now() - this.schemaCacheTime < 5 * 60 * 1000) {
      return this.schemaCache
    }

    const schemaQuery = `
      SELECT 
        t.table_schema,
        t.table_name,
        array_agg(
          json_build_object(
            'name', c.column_name,
            'type', c.data_type,
            'nullable', c.is_nullable = 'YES'
          ) ORDER BY c.ordinal_position
        ) as columns
      FROM information_schema.tables t
      JOIN information_schema.columns c 
        ON t.table_schema = c.table_schema 
        AND t.table_name = c.table_name
      WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
        AND t.table_type = 'BASE TABLE'
      GROUP BY t.table_schema, t.table_name
      ORDER BY t.table_schema, t.table_name
    `

    const result = await pool.query(schemaQuery)
    const tables = result.rows.map(row => ({
      schema: row.table_schema,
      name: row.table_name,
      columns: row.columns
    }))

    this.schemaCache = { tables, relationships: [] }
    this.schemaCacheTime = Date.now()
    
    return this.schemaCache
  }

  parseNaturalLanguageQuery(query) {
    const lowerQuery = query.toLowerCase()
    
    // Check for exact template matches
    for (const [category, templates] of Object.entries(this.queryTemplates)) {
      for (const [key, sql] of Object.entries(templates)) {
        if (lowerQuery.includes(key)) {
          return {
            sql,
            category,
            confidence: 'high'
          }
        }
      }
    }

    // Pattern matching for common queries
    const patterns = [
      {
        regex: /show\s+(?:me\s+)?all\s+(\w+)/i,
        template: (match) => `SELECT * FROM ${match[1]} LIMIT 100`
      },
      {
        regex: /count\s+(?:of\s+)?(\w+)/i,
        template: (match) => `SELECT COUNT(*) as count FROM ${match[1]}`
      },
      {
        regex: /(\w+)\s+(?:from|in)\s+(?:the\s+)?last\s+(\d+)\s+(days?|months?|years?)/i,
        template: (match) => `
          SELECT * FROM ${match[1]} 
          WHERE created_at >= CURRENT_DATE - INTERVAL '${match[2]} ${match[3]}'
          ORDER BY created_at DESC
        `
      },
      {
        regex: /top\s+(\d+)\s+(\w+)(?:\s+by\s+(\w+))?/i,
        template: (match) => `
          SELECT * FROM ${match[2]}
          ${match[3] ? `ORDER BY ${match[3]} DESC` : ''}
          LIMIT ${match[1]}
        `
      }
    ]

    for (const pattern of patterns) {
      const match = query.match(pattern.regex)
      if (match) {
        return {
          sql: pattern.template(match),
          category: 'pattern',
          confidence: 'medium'
        }
      }
    }

    return null
  }

  async enhanceWithAI(query, schema) {
    if (!openai) {
      return null
    }

    try {
      const schemaDescription = schema.tables
        .map(t => `${t.schema}.${t.name}: ${t.columns.map(c => c.name).join(', ')}`)
        .join('\n')

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a PostgreSQL expert for a Mexican real estate platform. Convert natural language requests into SQL queries.

Database schema:
${schemaDescription}

Important context about Mexican real estate:
- Mexico City delegaciones include: Cuauhtémoc, Miguel Hidalgo, Benito Juárez, Álvaro Obregón, Coyoacán, Tlalpan, Xochimilco, Azcapotzalco, Gustavo A. Madero, Iztapalapa, etc.
- Property types in Spanish: Casa (house), Departamento (apartment), Local (commercial), Oficina (office), Bodega (warehouse), Terreno (land)
- Prices are typically in MXN (Mexican pesos) or USD
- Common neighborhoods: Polanco, Roma Norte, Condesa, Del Valle, Santa Fe, etc.

Rules:
- Always use READ ONLY safe queries (SELECT only)
- When user asks about "Mexico City" or "CDMX", search for all delegaciones listed above
- For location queries, use ILIKE for partial matches: city ILIKE '%pattern%'
- Include GROUP BY for aggregations and counts
- Add percentage calculations when showing distributions
- Order results by count/relevance DESC
- Limit results appropriately (default 100 unless specified)
- Return ONLY the SQL query, no explanations or markdown`
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      })

      // Clean the SQL response - remove any markdown formatting
      let sqlQuery = completion.choices[0].message.content.trim()
      
      // Remove markdown code blocks if present
      sqlQuery = sqlQuery.replace(/^```sql\s*\n?/i, '').replace(/\n?```\s*$/i, '')
      sqlQuery = sqlQuery.replace(/^```\s*\n?/i, '').replace(/\n?```\s*$/i, '')
      
      return {
        sql: sqlQuery.trim(),
        category: 'ai-generated',
        confidence: 'high'
      }
    } catch (error) {
      console.error('AI enhancement failed:', error)
      return null
    }
  }

  async processQuery(naturalLanguageQuery) {
    const startTime = Date.now()
    
    // Get schema
    const schema = await this.getSchema()
    
    let queryInfo
    
    // Prioritize AI if available for better analytical responses
    if (openai) {
      queryInfo = await this.enhanceWithAI(naturalLanguageQuery, schema)
    }
    
    // Fall back to pattern matching if AI fails or is not available
    if (!queryInfo) {
      queryInfo = this.parseNaturalLanguageQuery(naturalLanguageQuery)
    }
    
    if (!queryInfo) {
      throw new Error('Could not understand the query. Please try rephrasing.')
    }

    // Execute query
    const result = await pool.query(queryInfo.sql)
    const executionTime = Date.now() - startTime

    // Analyze results - use AI for comprehensive analysis if available
    let analysis
    if (openai && result.rows.length > 0) {
      analysis = await this.analyzeResultsWithAI(result.rows, naturalLanguageQuery, queryInfo.sql)
    } else {
      analysis = this.analyzeResults(result.rows, naturalLanguageQuery)
    }
    
    // Generate visualizations
    const visualizations = this.suggestVisualizations(result.rows, analysis)
    
    // Generate follow-up suggestions
    const suggestions = this.generateSuggestions(naturalLanguageQuery, result.rows)

    return {
      data: result.rows,
      columns: result.fields.map(field => ({
        name: field.name,
        type: field.dataTypeID ? this.getDataType(field.dataTypeID) : 'unknown',
        nullable: true
      })),
      rowCount: result.rowCount,
      executionTime,
      query: queryInfo.sql,
      analysis,
      visualizations,
      suggestions
    }
  }

  async analyzeResultsWithAI(data, query, sql) {
    try {
      // Prepare data summary for AI analysis
      const dataSample = data.slice(0, 20) // Send sample to avoid token limits
      const totalRows = data.length
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a data analyst for a Mexican real estate platform. Analyze query results and provide comprehensive insights in the style of a market research report.

Your analysis should follow this structure:

## Summary
Start with a headline insight (e.g., "Mexico City is your #1 market with X listings")

## Key Metrics
- Total counts with percentages of database
- Comparisons between categories
- Market share breakdowns

## Detailed Breakdown
For location queries:
- List top 5-10 locations with counts and percentages
- Include location context (e.g., "Polanco - upscale neighborhood")

For property types:
- Show distribution with counts and percentages
- Use both Spanish and English names

## Market Insights
- Identify patterns and trends
- Highlight market characteristics
- Compare to other markets when relevant
- Note any surprising findings

## Business Recommendations
- Opportunities for growth
- Areas needing attention
- Strategic insights

Format guidelines:
- Use numbers with commas (1,366 not 1366)
- Show percentages to 2 decimal places
- Bold important numbers and findings
- Use bullet points for clarity
- Be specific with location and property names`
          },
          {
            role: "user",
            content: `Query: "${query}"
SQL executed: ${sql}
Total results: ${totalRows}
Sample data: ${JSON.stringify(dataSample, null, 2)}

Provide a comprehensive analysis of these results.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const aiAnalysis = completion.choices[0].message.content
      
      // Parse the AI response into structured format
      return {
        summary: aiAnalysis,
        insights: [],
        patterns: [],
        recommendations: []
      }
    } catch (error) {
      console.error('AI analysis failed:', error)
      // Fall back to basic analysis
      return this.analyzeResults(data, query)
    }
  }

  analyzeResults(data, query) {
    if (!data || data.length === 0) {
      return {
        summary: 'No data found for your query.',
        insights: [],
        patterns: [],
        recommendations: []
      }
    }

    const insights = []
    const patterns = []
    const recommendations = []

    // Basic statistics
    const rowCount = data.length
    insights.push(`Found ${rowCount} ${rowCount === 1 ? 'record' : 'records'}`)

    // Time-based analysis
    const dateColumns = Object.keys(data[0] || {}).filter(key => 
      key.includes('date') || key.includes('time') || key.includes('_at')
    )
    
    if (dateColumns.length > 0) {
      const dateColumn = dateColumns[0]
      const dates = data.map(row => new Date(row[dateColumn])).filter(d => !isNaN(d))
      
      if (dates.length > 0) {
        const earliest = new Date(Math.min(...dates))
        const latest = new Date(Math.max(...dates))
        insights.push(`Data spans from ${earliest.toLocaleDateString()} to ${latest.toLocaleDateString()}`)
        
        // Check for trends
        if (dates.length > 10) {
          patterns.push({
            type: 'trend',
            description: 'Time-based data detected',
            significance: 'medium'
          })
          recommendations.push('Consider visualizing this data as a time series chart')
        }
      }
    }

    // Numeric analysis
    const numericColumns = Object.keys(data[0] || {}).filter(key => 
      typeof data[0][key] === 'number'
    )
    
    for (const col of numericColumns) {
      const values = data.map(row => row[col]).filter(v => v !== null)
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0)
        const avg = sum / values.length
        const max = Math.max(...values)
        const min = Math.min(...values)
        
        if (max > min) {
          insights.push(`${col}: ranges from ${min} to ${max} (avg: ${avg.toFixed(2)})`)
        }
      }
    }

    return {
      summary: this.generateSummary(query, data, insights),
      insights,
      patterns,
      recommendations
    }
  }

  generateSummary(query, data, insights) {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('growth')) {
      return `Analysis shows ${insights[0]}. ${insights[1] || ''}`
    }
    
    if (lowerQuery.includes('count') || lowerQuery.includes('how many')) {
      return `The total count is ${data[0]?.count || data.length}.`
    }
    
    if (lowerQuery.includes('recent') || lowerQuery.includes('latest')) {
      return `Here are the most recent records. ${insights[0]}`
    }
    
    return insights.join('. ')
  }

  suggestVisualizations(data, analysis) {
    const visualizations = []
    
    if (!data || data.length === 0) return visualizations

    // Time series visualization
    const dateColumns = Object.keys(data[0]).filter(key => 
      key.includes('date') || key.includes('time') || key.includes('_at')
    )
    const numericColumns = Object.keys(data[0]).filter(key => 
      typeof data[0][key] === 'number' && !key.includes('id')
    )

    if (dateColumns.length > 0 && numericColumns.length > 0) {
      visualizations.push({
        type: 'line',
        title: 'Trend Over Time',
        xAxis: dateColumns[0],
        yAxis: numericColumns[0],
        data: data.slice(0, 50)
      })
    }

    // Bar chart for categorical data
    if (data.length < 20 && numericColumns.length > 0) {
      const labelColumn = Object.keys(data[0]).find(key => 
        typeof data[0][key] === 'string' && !key.includes('id')
      )
      
      if (labelColumn) {
        visualizations.push({
          type: 'bar',
          title: 'Distribution',
          xAxis: labelColumn,
          yAxis: numericColumns[0],
          data: data
        })
      }
    }

    return visualizations
  }

  generateSuggestions(query, results) {
    const suggestions = []
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes('user')) {
      suggestions.push('Show me user activity patterns')
      suggestions.push('What is the user retention rate?')
      suggestions.push('Show me users by location')
    }

    if (results.length > 0) {
      suggestions.push('Export this data as CSV')
      suggestions.push('Show me more details about the first record')
      
      if (results.length === 100) {
        suggestions.push('Show me the next 100 records')
      }
    }

    return suggestions
  }

  getDataType(oid) {
    const typeMap = {
      16: 'boolean',
      20: 'bigint',
      21: 'smallint',
      23: 'integer',
      25: 'text',
      700: 'real',
      701: 'double precision',
      1082: 'date',
      1114: 'timestamp',
      1184: 'timestamptz',
      1043: 'varchar',
      3802: 'jsonb'
    }
    return typeMap[oid] || 'unknown'
  }

  async getSuggestions(partialQuery) {
    const suggestions = []
    const lower = partialQuery.toLowerCase()

    // Static suggestions
    const staticSuggestions = [
      'Show me all users',
      'How many users signed up today?',
      'What are the largest tables?',
      'Show me recent activity',
      'Check database performance',
      'Find data quality issues'
    ]

    suggestions.push(...staticSuggestions.filter(s => 
      s.toLowerCase().includes(lower)
    ))

    // Dynamic suggestions based on schema
    const schema = await this.getSchema()
    schema.tables.forEach(table => {
      if (table.name.includes(lower)) {
        suggestions.push(`Show me all records from ${table.name}`)
        suggestions.push(`Count records in ${table.name}`)
      }
    })

    return suggestions.slice(0, 5)
  }
}

module.exports = new NLPService()