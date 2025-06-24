require('dotenv').config();
const { Pool } = require('pg');
const OpenAI = require('openai');

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Blog post topics for automatic generation
const blogTopics = [
  {
    type: 'market-trends',
    prompts: [
      'Tendencias del mercado inmobiliario en {city} para {month} {year}',
      'Análisis de precios de departamentos en {city} - {month} {year}',
      'Oportunidades de inversión en {city} este {month}',
      'Mercado de casas de lujo en {city} - Reporte {month} {year}'
    ]
  },
  {
    type: 'investment-guide',
    prompts: [
      'Guía para invertir en propiedades de {city} en {year}',
      'ROI en bienes raíces: {city} vs otras ciudades mexicanas',
      'Mejores colonias para inversión en {city} - {month} {year}',
      'Propiedades pre-venta en {city}: ¿Vale la pena invertir?'
    ]
  },
  {
    type: 'lifestyle',
    prompts: [
      'Vivir en {city}: Guía completa para {year}',
      'Las mejores colonias familiares en {city}',
      'Costo de vida en {city} para expatriados - {year}',
      '{city} para nómadas digitales: Zonas y precios'
    ]
  },
  {
    type: 'legal-tax',
    prompts: [
      'Impuestos inmobiliarios en {city}: Guía {year}',
      'Proceso de compra de propiedades en {city} para extranjeros',
      'Fideicomiso en {city}: Todo lo que necesitas saber',
      'Cambios legales en bienes raíces {city} - {year}'
    ]
  }
];

const cities = [
  'Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro',
  'Mérida', 'Playa del Carmen', 'Tulum', 'Puerto Vallarta', 'San Miguel de Allende',
  'Cancún', 'Cabo San Lucas', 'Mazatlán', 'Oaxaca', 'Guanajuato'
];

const months = {
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June',
       'July', 'August', 'September', 'October', 'November', 'December']
};

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getMarketData(city) {
  try {
    // Get real data from our database
    const query = `
      SELECT 
        COUNT(*) as total_properties,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(bedrooms) as avg_bedrooms
      FROM properties 
      WHERE city ILIKE $1
    `;
    
    const result = await pool.query(query, [`%${city}%`]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}

async function generateBlogPost(topic, city, marketData) {
  const currentDate = new Date();
  const monthEs = months.es[currentDate.getMonth()];
  const monthEn = months.en[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  
  // Select random prompt from topic
  let titleTemplate = getRandomElement(topic.prompts);
  const title = titleTemplate
    .replace('{city}', city)
    .replace('{month}', monthEs)
    .replace('{year}', year);

  try {
    // Generate content using GPT-4
    const prompt = `
    Escribe un artículo completo en español sobre: "${title}"
    
    ${marketData ? `Usa estos datos reales del mercado:
    - Total de propiedades disponibles: ${Math.round(marketData.total_properties)}
    - Precio promedio: $${Math.round(marketData.avg_price).toLocaleString()} MXN
    - Rango de precios: $${Math.round(marketData.min_price).toLocaleString()} - $${Math.round(marketData.max_price).toLocaleString()} MXN
    - Promedio de recámaras: ${Math.round(marketData.avg_bedrooms)}` : ''}
    
    El artículo debe:
    1. Tener entre 800-1200 palabras
    2. Incluir subtítulos con etiquetas HTML (h2, h3)
    3. Ser informativo y útil para compradores/inversionistas
    4. Incluir datos específicos y consejos prácticos
    5. Mencionar colonias o zonas específicas de ${city}
    6. Tener un tono profesional pero accesible
    7. Incluir una conclusión con llamada a la acción
    
    Formato: HTML (párrafos con <p>, subtítulos con <h2> y <h3>, listas con <ul>/<li>)
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un experto en bienes raíces mexicanos y escribes contenido SEO-optimizado."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;

    // Generate summary
    const summaryCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Resume este artículo en 2-3 oraciones (máximo 160 caracteres): ${content.substring(0, 500)}...`
        }
      ],
      max_tokens: 100
    });

    const summary = summaryCompletion.choices[0].message.content;

    // Generate tags
    const tags = [
      city,
      monthEs + ' ' + year,
      'mercado inmobiliario',
      'inversión',
      'bienes raíces ' + city.toLowerCase()
    ];

    // Select appropriate image
    const imageUrls = [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop', // Modern buildings
      'https://images.unsplash.com/photo-1565402170291-8491f14678db?w=1200&h=600&fit=crop', // City view
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop', // Residential
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=600&fit=crop', // Luxury home
      'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&h=600&fit=crop', // House exterior
    ];

    const slug = generateSlug(title) + '-' + Date.now();

    // Determine category based on topic type
    const categoryMap = {
      'market-trends': 'market-insights',
      'investment-guide': 'investment-guide',
      'lifestyle': 'lifestyle',
      'legal-tax': 'legal-guide'
    };

    return {
      slug,
      title,
      title_es: title,
      summary: summary.substring(0, 160),
      summary_es: summary.substring(0, 160),
      content,
      content_es: content,
      category: categoryMap[topic.type] || 'market-insights',
      tags,
      featured_image_url: getRandomElement(imageUrls),
      meta_title: title.substring(0, 60),
      meta_description: summary.substring(0, 160)
    };

  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

async function createAndPublishBlogPost() {
  try {
    console.log('🤖 AI Blog Post Generator\n');
    
    // Select random topic and city
    const topicCategory = getRandomElement(Object.keys(blogTopics));
    const topic = blogTopics.find(t => t.type === topicCategory);
    const city = getRandomElement(cities);
    
    console.log(`📍 Ciudad seleccionada: ${city}`);
    console.log(`📝 Tipo de artículo: ${topicCategory}\n`);
    
    // Get market data
    console.log('📊 Obteniendo datos del mercado...');
    const marketData = await getMarketData(city);
    
    // Generate blog post
    console.log('✍️  Generando contenido con IA...');
    const blogPost = await generateBlogPost(topic, city, marketData);
    
    console.log(`\n📰 Título: ${blogPost.title}`);
    console.log(`🔗 Slug: ${blogPost.slug}`);
    
    // Save to database
    console.log('\n💾 Guardando en la base de datos...');
    const result = await pool.query(`
      INSERT INTO blog_posts (
        slug, title, title_es, summary, summary_es,
        content, content_es, category, tags,
        status, featured_image_url,
        meta_title, meta_description, published_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        'published', $10, $11, $12, NOW()
      ) RETURNING id
    `, [
      blogPost.slug,
      blogPost.title,
      blogPost.title_es,
      blogPost.summary,
      blogPost.summary_es,
      blogPost.content,
      blogPost.content_es,
      blogPost.category,
      blogPost.tags,
      blogPost.featured_image_url,
      blogPost.meta_title,
      blogPost.meta_description
    ]);
    
    console.log('\n✅ ¡Artículo publicado exitosamente!');
    console.log(`🌐 URL: https://mexican-real-estate-ai-jy2t.vercel.app/blog/${blogPost.slug}`);
    console.log(`\n📈 Estadísticas del artículo:`);
    console.log(`   - Palabras: ${blogPost.content.split(' ').length}`);
    console.log(`   - Categoría: ${blogPost.category}`);
    console.log(`   - Tags: ${blogPost.tags.join(', ')}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

// Add command line options
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(`
🤖 AI Blog Post Generator para Mexican Real Estate

Uso:
  node generateAIBlogPost.js              # Genera un artículo aleatorio
  node generateAIBlogPost.js --schedule   # Muestra cómo programar posts automáticos
  node generateAIBlogPost.js --help       # Muestra esta ayuda

Este script:
- Selecciona una ciudad y tema aleatorio
- Obtiene datos reales del mercado de tu base de datos
- Genera contenido único usando GPT-4
- Publica automáticamente el artículo
  `);
  process.exit(0);
}

if (args.includes('--schedule')) {
  console.log(`
📅 Para programar posts automáticos:

1. Usando cron (Linux/Mac):
   # Agregar a crontab -e
   0 9 * * MON cd /path/to/backend && node src/scripts/generateAIBlogPost.js
   # Genera un post cada lunes a las 9 AM

2. Usando GitHub Actions:
   # Crear .github/workflows/blog-generator.yml
   # Configurar para ejecutar periódicamente

3. Usando servicios externos:
   - Heroku Scheduler
   - AWS Lambda + CloudWatch
   - Google Cloud Functions + Cloud Scheduler
  `);
  process.exit(0);
}

// Run the generator
createAndPublishBlogPost();