const OpenAI = require('openai')
const { Pool } = require('pg')
const nlpService = require('./nlpService')

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

class BlogGenerationService {
  constructor() {
    this.templates = new Map()
    // Load templates after a delay to ensure database is ready
    setTimeout(() => this.loadTemplates(), 1000)
  }

  async loadTemplates() {
    try {
      const result = await pool.query('SELECT * FROM blog_templates WHERE is_active = true')
      result.rows.forEach(template => {
        this.templates.set(template.template_type, template)
      })
      console.log(`Loaded ${this.templates.size} blog templates`)
    } catch (error) {
      console.error('Error loading blog templates:', error.message)
      // Retry after 5 seconds if failed
      setTimeout(() => this.loadTemplates(), 5000)
    }
  }

  // Generate blog post from template and data
  async generateBlogPost(templateType, parameters = {}) {
    if (!openai) {
      throw new Error('OpenAI API key not configured')
    }

    const template = this.templates.get(templateType)
    if (!template) {
      throw new Error(`Template type ${templateType} not found`)
    }

    try {
      // Fetch required data based on template
      const data = await this.fetchDataForTemplate(template, parameters)
      
      // Generate content using AI
      const content = await this.generateContent(template, data, parameters)
      
      // Create blog post record
      const blogPost = await this.saveBlogPost(content, template, data)
      
      return blogPost
    } catch (error) {
      console.error('Error generating blog post:', error)
      throw error
    }
  }

  async fetchDataForTemplate(template, parameters) {
    const data = {}
    const queries = template.data_requirements?.queries || []
    
    for (const query of queries) {
      // Replace parameters in query
      let processedQuery = query
      Object.keys(parameters).forEach(key => {
        processedQuery = processedQuery.replace(`{${key}}`, parameters[key])
      })
      
      try {
        // Use our existing NLP service to execute queries
        const result = await nlpService.processQuery(processedQuery)
        data[query] = result
      } catch (error) {
        console.error(`Error executing query: ${processedQuery}`, error)
        data[query] = null
      }
    }
    
    return data
  }

  async generateContent(template, data, parameters) {
    const sections = template.content_structure.sections
    const generatedSections = []
    
    // Generate title
    let title = template.title_template
    Object.keys(parameters).forEach(key => {
      title = title.replace(`{${key}}`, parameters[key])
    })
    
    // Add current date parameters
    const now = new Date()
    title = title.replace('{month}', now.toLocaleString('es-MX', { month: 'long' }))
    title = title.replace('{year}', now.getFullYear())
    
    // Generate each section
    for (const section of sections) {
      const sectionContent = await this.generateSection(section, data, parameters)
      generatedSections.push(sectionContent)
    }
    
    // Combine all sections into final content
    const fullContent = await this.combineAndRefine(title, generatedSections, template.template_type)
    
    return {
      title,
      title_es: title, // Already in Spanish
      content: fullContent.content,
      content_es: fullContent.content, // Already in Spanish
      summary: fullContent.summary,
      summary_es: fullContent.summary,
      meta_title: fullContent.meta_title,
      meta_description: fullContent.meta_description,
      tags: fullContent.tags
    }
  }

  async generateSection(section, data, parameters) {
    const relevantData = this.extractRelevantData(section.type, data)
    
    const prompt = `
Eres un experto en bienes raíces mexicano escribiendo contenido para un blog inmobiliario.
Genera contenido para la sección "${section.title}" de tipo "${section.type}".

Datos disponibles:
${JSON.stringify(relevantData, null, 2)}

Parámetros del artículo:
${JSON.stringify(parameters, null, 2)}

Instrucciones:
1. Escribe en español mexicano profesional pero accesible
2. Usa datos específicos y porcentajes cuando estén disponibles
3. Incluye insights valiosos basados en los datos
4. Mantén un tono informativo y útil
5. Si es relevante, menciona aspectos únicos del mercado mexicano (INFONAVIT, fideicomiso, etc.)
6. Incluye 2-3 párrafos de contenido rico y detallado
7. Usa formato Markdown para mejor estructura

Genera el contenido para esta sección:`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Eres un experto redactor de contenido inmobiliario mexicano." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    })
    
    return {
      type: section.type,
      title: section.title,
      content: completion.choices[0].message.content
    }
  }

  extractRelevantData(sectionType, data) {
    // Extract only the relevant data for each section type
    const relevant = {}
    
    Object.entries(data).forEach(([query, result]) => {
      if (result && result.data) {
        // Simplify data for AI consumption
        relevant[query] = {
          rowCount: result.rowCount,
          sample: result.data.slice(0, 10),
          analysis: result.analysis?.summary || ''
        }
      }
    })
    
    return relevant
  }

  async combineAndRefine(title, sections, templateType) {
    const sectionsMarkdown = sections.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n')
    
    const prompt = `
Revisa y mejora el siguiente artículo de blog sobre bienes raíces en México:

Título: ${title}
Tipo: ${templateType}

Contenido:
${sectionsMarkdown}

Tareas:
1. Asegura coherencia y fluidez entre secciones
2. Agrega una introducción atractiva (2-3 párrafos)
3. Agrega una conclusión con llamada a la acción
4. Genera un resumen ejecutivo (2-3 oraciones)
5. Crea un meta título SEO (máximo 60 caracteres)
6. Crea una meta descripción SEO (máximo 160 caracteres)
7. Sugiere 5-8 tags relevantes
8. Asegura que el tono sea profesional pero accesible
9. Verifica que se use español mexicano correctamente

Formato de respuesta JSON:
{
  "content": "contenido completo del artículo en markdown",
  "summary": "resumen ejecutivo",
  "meta_title": "título SEO",
  "meta_description": "descripción SEO",
  "tags": ["tag1", "tag2", ...]
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Eres un editor experto en contenido inmobiliario y SEO." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    })
    
    return JSON.parse(completion.choices[0].message.content)
  }

  async saveBlogPost(content, template, sourceData) {
    const slug = this.generateSlug(content.title)
    
    const query = `
      INSERT INTO blog_posts (
        slug, title, title_es, summary, summary_es,
        content, content_es, category, tags,
        meta_title, meta_description,
        status, generation_type, data_sources, ai_model
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `
    
    const values = [
      slug,
      content.title,
      content.title_es,
      content.summary,
      content.summary_es,
      content.content,
      content.content_es,
      this.getCategoryForTemplate(template.template_type),
      content.tags,
      content.meta_title,
      content.meta_description,
      'draft',
      'ai_generated',
      JSON.stringify({ template_id: template.id, queries: Object.keys(sourceData) }),
      'gpt-4o'
    ]
    
    const result = await pool.query(query, values)
    return result.rows[0]
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100)
  }

  getCategoryForTemplate(templateType) {
    const categoryMap = {
      'market_analysis': 'analisis-mercado',
      'comparison': 'guia-compra',
      'investment': 'inversion',
      'guide': 'guia-colonias',
      'seasonal': 'tendencias'
    }
    return categoryMap[templateType] || 'tendencias'
  }

  // Schedule automatic blog generation
  async scheduleGeneration(templateType, parameters, scheduledFor) {
    const query = `
      INSERT INTO blog_generation_jobs (
        template_id, scheduled_for, metadata
      ) VALUES (
        (SELECT id FROM blog_templates WHERE template_type = $1),
        $2, $3
      ) RETURNING *
    `
    
    const result = await pool.query(query, [templateType, scheduledFor, parameters])
    return result.rows[0]
  }

  // Process scheduled jobs
  async processScheduledJobs() {
    const query = `
      SELECT * FROM blog_generation_jobs 
      WHERE status = 'pending' 
      AND scheduled_for <= NOW()
      ORDER BY scheduled_for
      LIMIT 5
    `
    
    const result = await pool.query(query)
    
    for (const job of result.rows) {
      try {
        // Update job status
        await pool.query(
          'UPDATE blog_generation_jobs SET status = $1, started_at = NOW() WHERE id = $2',
          ['processing', job.id]
        )
        
        // Generate blog post
        const template = await pool.query(
          'SELECT * FROM blog_templates WHERE id = $1',
          [job.template_id]
        )
        
        const blogPost = await this.generateBlogPost(
          template.rows[0].template_type,
          job.metadata || {}
        )
        
        // Update job with success
        await pool.query(
          'UPDATE blog_generation_jobs SET status = $1, completed_at = NOW(), generated_post_id = $2 WHERE id = $3',
          ['completed', blogPost.id, job.id]
        )
      } catch (error) {
        // Update job with error
        await pool.query(
          'UPDATE blog_generation_jobs SET status = $1, error_message = $2 WHERE id = $3',
          ['failed', error.message, job.id]
        )
      }
    }
  }

  // Generate market insights for a specific city
  async generateCityInsights(city) {
    return this.generateBlogPost('market_analysis', { city })
  }

  // Generate comparison between two cities
  async generateCityComparison(city1, city2) {
    return this.generateBlogPost('comparison', { city1, city2 })
  }
}

module.exports = new BlogGenerationService()