require('dotenv').config();
const { Pool } = require('pg');
const crypto = require('crypto');

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const blogPosts = [
  {
    title: "Análisis del Mercado Inmobiliario en Ciudad de México 2025",
    title_es: "Análisis del Mercado Inmobiliario en Ciudad de México 2025",
    slug: "analisis-mercado-inmobiliario-cdmx-2025",
    summary: "Un análisis profundo del mercado inmobiliario en la Ciudad de México, incluyendo tendencias en Polanco, Roma Norte y Condesa.",
    summary_es: "Un análisis profundo del mercado inmobiliario en la Ciudad de México, incluyendo tendencias en Polanco, Roma Norte y Condesa.",
    content: `<h2>El Mercado Inmobiliario de CDMX en 2025</h2>
<p>La Ciudad de México continúa siendo uno de los mercados inmobiliarios más dinámicos de América Latina. Con más de 10,500 propiedades en nuestra base de datos, hemos analizado las tendencias actuales en las colonias más codiciadas.</p>
<h3>Polanco: El Lujo que No Conoce Crisis</h3>
<p>Polanco mantiene su posición como la zona más exclusiva de la ciudad, con precios promedio de $150,000 MXN por metro cuadrado en departamentos de lujo.</p>
<h3>Roma Norte y Condesa: El Boom Continúa</h3>
<p>Estas colonias bohemias siguen atrayendo a jóvenes profesionales y extranjeros, con un incremento del 15% en los precios durante el último año.</p>`,
    content_es: `<h2>El Mercado Inmobiliario de CDMX en 2025</h2>
<p>La Ciudad de México continúa siendo uno de los mercados inmobiliarios más dinámicos de América Latina. Con más de 10,500 propiedades en nuestra base de datos, hemos analizado las tendencias actuales en las colonias más codiciadas.</p>
<h3>Polanco: El Lujo que No Conoce Crisis</h3>
<p>Polanco mantiene su posición como la zona más exclusiva de la ciudad, con precios promedio de $150,000 MXN por metro cuadrado en departamentos de lujo.</p>
<h3>Roma Norte y Condesa: El Boom Continúa</h3>
<p>Estas colonias bohemias siguen atrayendo a jóvenes profesionales y extranjeros, con un incremento del 15% en los precios durante el último año.</p>`,
    category: "market-insights",
    tags: ["CDMX", "Polanco", "Roma Norte", "Condesa", "inversión inmobiliaria"],
    meta_title: "Análisis Mercado Inmobiliario CDMX 2025 | Polanco, Roma Norte, Condesa",
    meta_description: "Descubre las tendencias del mercado inmobiliario en Ciudad de México 2025. Análisis de precios en Polanco, Roma Norte y Condesa."
  },
  {
    title: "Guadalajara: La Perla de Occidente para Inversionistas",
    title_es: "Guadalajara: La Perla de Occidente para Inversionistas",
    slug: "guadalajara-mercado-inmobiliario-inversion-2025",
    summary: "Guadalajara se consolida como un destino prime para inversión inmobiliaria, con desarrollos en Providencia, Chapalita y Zapopan.",
    summary_es: "Guadalajara se consolida como un destino prime para inversión inmobiliaria, con desarrollos en Providencia, Chapalita y Zapopan.",
    content: `<h2>Guadalajara: El Silicon Valley Mexicano</h2>
<p>Con la llegada de más empresas tecnológicas, Guadalajara experimenta un boom inmobiliario sin precedentes. Los precios han aumentado un 20% en zonas como Providencia y Chapalita.</p>
<h3>Zapopan: El Nuevo Centro de Negocios</h3>
<p>Zapopan se ha convertido en el epicentro del desarrollo corporativo, con torres de oficinas y complejos residenciales de alta gama.</p>`,
    content_es: `<h2>Guadalajara: El Silicon Valley Mexicano</h2>
<p>Con la llegada de más empresas tecnológicas, Guadalajara experimenta un boom inmobiliario sin precedentes. Los precios han aumentado un 20% en zonas como Providencia y Chapalita.</p>
<h3>Zapopan: El Nuevo Centro de Negocios</h3>
<p>Zapopan se ha convertido en el epicentro del desarrollo corporativo, con torres de oficinas y complejos residenciales de alta gama.</p>`,
    category: "market-insights",
    tags: ["Guadalajara", "Zapopan", "Providencia", "tecnología", "inversión"],
    meta_title: "Mercado Inmobiliario Guadalajara 2025 | Inversión en Providencia y Zapopan",
    meta_description: "Análisis del mercado inmobiliario en Guadalajara. Oportunidades de inversión en Providencia, Chapalita y Zapopan."
  },
  {
    title: "Monterrey: El Gigante Industrial y su Boom Inmobiliario",
    title_es: "Monterrey: El Gigante Industrial y su Boom Inmobiliario",
    slug: "monterrey-boom-inmobiliario-2025",
    summary: "Monterrey lidera el crecimiento inmobiliario del norte de México con desarrollos premium en San Pedro, Valle Oriente y Cumbres.",
    summary_es: "Monterrey lidera el crecimiento inmobiliario del norte de México con desarrollos premium en San Pedro, Valle Oriente y Cumbres.",
    content: `<h2>Monterrey: Potencia Económica del Norte</h2>
<p>La capital de Nuevo León continúa atrayendo inversión nacional e internacional. San Pedro Garza García mantiene los precios más altos del país después de Polanco.</p>
<h3>Valle Oriente: El Nuevo Skyline</h3>
<p>Con más de 50 torres en construcción, Valle Oriente se perfila como el distrito de negocios más importante del norte de México.</p>`,
    content_es: `<h2>Monterrey: Potencia Económica del Norte</h2>
<p>La capital de Nuevo León continúa atrayendo inversión nacional e internacional. San Pedro Garza García mantiene los precios más altos del país después de Polanco.</p>
<h3>Valle Oriente: El Nuevo Skyline</h3>
<p>Con más de 50 torres en construcción, Valle Oriente se perfila como el distrito de negocios más importante del norte de México.</p>`,
    category: "market-insights",
    tags: ["Monterrey", "San Pedro", "Valle Oriente", "Cumbres", "nearshoring"],
    meta_title: "Monterrey Mercado Inmobiliario 2025 | San Pedro y Valle Oriente",
    meta_description: "Descubre el boom inmobiliario en Monterrey. Análisis de precios en San Pedro Garza García, Valle Oriente y Cumbres."
  },
  {
    title: "Riviera Maya: Playa del Carmen vs Tulum vs Cancún para Inversionistas",
    title_es: "Riviera Maya: Playa del Carmen vs Tulum vs Cancún para Inversionistas",
    slug: "riviera-maya-comparacion-inversion-2025",
    summary: "Comparamos las tres joyas de la Riviera Maya desde la perspectiva del inversionista inmobiliario internacional.",
    summary_es: "Comparamos las tres joyas de la Riviera Maya desde la perspectiva del inversionista inmobiliario internacional.",
    content: `<h2>La Batalla por la Inversión en el Caribe Mexicano</h2>
<p>La Riviera Maya sigue siendo el destino favorito para inversión extranjera en México. Analizamos las ventajas de cada destino.</p>
<h3>Playa del Carmen: ROI Comprobado</h3>
<p>Con una ocupación promedio del 75% en rentals vacacionales, Playa del Carmen ofrece los retornos más consistentes.</p>
<h3>Tulum: El Nuevo Hotspot</h3>
<p>A pesar de precios más altos, Tulum atrae a un segmento premium con propiedades eco-luxury que generan tarifas superiores.</p>
<h3>Cancún: El Clásico que No Falla</h3>
<p>La infraestructura establecida y el aeropuerto internacional hacen de Cancún la opción más segura para inversionistas conservadores.</p>`,
    content_es: `<h2>La Batalla por la Inversión en el Caribe Mexicano</h2>
<p>La Riviera Maya sigue siendo el destino favorito para inversión extranjera en México. Analizamos las ventajas de cada destino.</p>
<h3>Playa del Carmen: ROI Comprobado</h3>
<p>Con una ocupación promedio del 75% en rentals vacacionales, Playa del Carmen ofrece los retornos más consistentes.</p>
<h3>Tulum: El Nuevo Hotspot</h3>
<p>A pesar de precios más altos, Tulum atrae a un segmento premium con propiedades eco-luxury que generan tarifas superiores.</p>
<h3>Cancún: El Clásico que No Falla</h3>
<p>La infraestructura establecida y el aeropuerto internacional hacen de Cancún la opción más segura para inversionistas conservadores.</p>`,
    category: "investment-guide",
    tags: ["Playa del Carmen", "Tulum", "Cancún", "inversión", "rentals vacacionales"],
    meta_title: "Playa del Carmen vs Tulum vs Cancún | Guía de Inversión 2025",
    meta_description: "Compara las mejores opciones de inversión inmobiliaria en la Riviera Maya: Playa del Carmen, Tulum y Cancún."
  },
  {
    title: "San Miguel de Allende vs Querétaro: Destinos de Retiro para Expatriados",
    title_es: "San Miguel de Allende vs Querétaro: Destinos de Retiro para Expatriados",
    slug: "san-miguel-queretaro-retiro-expats-2025",
    summary: "Análisis comparativo de los mejores destinos para jubilados extranjeros en el Bajío mexicano.",
    summary_es: "Análisis comparativo de los mejores destinos para jubilados extranjeros en el Bajío mexicano.",
    content: `<h2>El Bajío: Paraíso para Retirados</h2>
<p>San Miguel de Allende y Querétaro lideran las preferencias de estadounidenses y canadienses que buscan retirarse en México.</p>
<h3>San Miguel de Allende: Patrimonio y Comunidad</h3>
<p>Con una vibrante comunidad expat de más de 10,000 residentes, San Miguel ofrece cultura, arte y un costo de vida razonable.</p>
<h3>Querétaro: Modernidad y Servicios</h3>
<p>Para quienes buscan servicios médicos de primer nivel y conectividad, Querétaro ofrece lo mejor de ambos mundos.</p>`,
    content_es: `<h2>El Bajío: Paraíso para Retirados</h2>
<p>San Miguel de Allende y Querétaro lideran las preferencias de estadounidenses y canadienses que buscan retirarse en México.</p>
<h3>San Miguel de Allende: Patrimonio y Comunidad</h3>
<p>Con una vibrante comunidad expat de más de 10,000 residentes, San Miguel ofrece cultura, arte y un costo de vida razonable.</p>
<h3>Querétaro: Modernidad y Servicios</h3>
<p>Para quienes buscan servicios médicos de primer nivel y conectividad, Querétaro ofrece lo mejor de ambos mundos.</p>`,
    category: "lifestyle",
    tags: ["San Miguel de Allende", "Querétaro", "retiro", "expatriados", "calidad de vida"],
    meta_title: "San Miguel de Allende vs Querétaro | Guía de Retiro para Expats 2025",
    meta_description: "Compara San Miguel de Allende y Querétaro como destinos de retiro. Guía completa para expatriados en México."
  },
  {
    title: "Mérida: La Ciudad Más Segura de México y su Auge Inmobiliario",
    title_es: "Mérida: La Ciudad Más Segura de México y su Auge Inmobiliario",
    slug: "merida-ciudad-segura-boom-inmobiliario-2025",
    summary: "Mérida se posiciona como el destino favorito para quienes buscan seguridad y calidad de vida en México.",
    summary_es: "Mérida se posiciona como el destino favorito para quienes buscan seguridad y calidad de vida en México.",
    content: `<h2>Mérida: Seguridad y Crecimiento</h2>
<p>Con los índices de seguridad más altos del país, Mérida atrae a familias mexicanas y extranjeros por igual.</p>
<h3>Norte de Mérida: El Nuevo Polo de Desarrollo</h3>
<p>Los desarrollos al norte de la ciudad ofrecen amenidades de primer mundo a precios todavía accesibles.</p>
<h3>Centro Histórico: Inversión con Historia</h3>
<p>Las casonas coloniales del centro siguen siendo una excelente opción para proyectos boutique y Airbnb.</p>`,
    content_es: `<h2>Mérida: Seguridad y Crecimiento</h2>
<p>Con los índices de seguridad más altos del país, Mérida atrae a familias mexicanas y extranjeros por igual.</p>
<h3>Norte de Mérida: El Nuevo Polo de Desarrollo</h3>
<p>Los desarrollos al norte de la ciudad ofrecen amenidades de primer mundo a precios todavía accesibles.</p>
<h3>Centro Histórico: Inversión con Historia</h3>
<p>Las casonas coloniales del centro siguen siendo una excelente opción para proyectos boutique y Airbnb.</p>`,
    category: "market-insights",
    tags: ["Mérida", "seguridad", "inversión", "calidad de vida", "Yucatán"],
    meta_title: "Mérida Mercado Inmobiliario 2025 | La Ciudad Más Segura de México",
    meta_description: "Descubre por qué Mérida es el destino inmobiliario más seguro de México. Análisis de precios y zonas de inversión."
  },
  {
    title: "Puerto Vallarta vs Mazatlán vs Cabo: Inversión en Propiedades de Playa",
    title_es: "Puerto Vallarta vs Mazatlán vs Cabo: Inversión en Propiedades de Playa",
    slug: "pacifico-mexicano-inversion-playa-2025",
    summary: "Comparativa de los tres principales destinos de playa del Pacífico mexicano para inversión inmobiliaria.",
    summary_es: "Comparativa de los tres principales destinos de playa del Pacífico mexicano para inversión inmobiliaria.",
    content: `<h2>El Pacífico Mexicano: Tres Joyas para Inversionistas</h2>
<p>Analizamos las ventajas y desventajas de invertir en los principales destinos de playa del Pacífico.</p>
<h3>Puerto Vallarta: Tradición y Rentabilidad</h3>
<p>Con 50 años de historia turística, Puerto Vallarta ofrece un mercado maduro y estable para inversión.</p>
<h3>Mazatlán: El Despertar del Gigante</h3>
<p>Tras años de renovación urbana, Mazatlán emerge como una opción de alto potencial y precios atractivos.</p>
<h3>Los Cabos: Lujo y Exclusividad</h3>
<p>El destino más exclusivo de México atrae a compradores de alto poder adquisitivo, con propiedades desde $1M USD.</p>`,
    content_es: `<h2>El Pacífico Mexicano: Tres Joyas para Inversionistas</h2>
<p>Analizamos las ventajas y desventajas de invertir en los principales destinos de playa del Pacífico.</p>
<h3>Puerto Vallarta: Tradición y Rentabilidad</h3>
<p>Con 50 años de historia turística, Puerto Vallarta ofrece un mercado maduro y estable para inversión.</p>
<h3>Mazatlán: El Despertar del Gigante</h3>
<p>Tras años de renovación urbana, Mazatlán emerge como una opción de alto potencial y precios atractivos.</p>
<h3>Los Cabos: Lujo y Exclusividad</h3>
<p>El destino más exclusivo de México atrae a compradores de alto poder adquisitivo, con propiedades desde $1M USD.</p>`,
    category: "investment-guide",
    tags: ["Puerto Vallarta", "Mazatlán", "Los Cabos", "inversión playa", "turismo"],
    meta_title: "Puerto Vallarta vs Mazatlán vs Cabo | Inversión en Playa 2025",
    meta_description: "Compara las mejores opciones de inversión en propiedades de playa en el Pacífico mexicano."
  },
  {
    title: "Puebla: El Tesoro Colonial con Precios Accesibles",
    title_es: "Puebla: El Tesoro Colonial con Precios Accesibles",
    slug: "puebla-mercado-inmobiliario-colonial-2025",
    summary: "Puebla combina patrimonio histórico con desarrollo moderno, ofreciendo oportunidades únicas de inversión.",
    summary_es: "Puebla combina patrimonio histórico con desarrollo moderno, ofreciendo oportunidades únicas de inversión.",
    content: `<h2>Puebla: Historia y Modernidad</h2>
<p>A solo 2 horas de CDMX, Puebla ofrece una alternativa atractiva con precios 40% menores que la capital.</p>
<h3>Angelópolis: El Nuevo Puebla</h3>
<p>Este desarrollo maestro ha transformado la ciudad, atrayendo empresas y residentes de alto nivel.</p>
<h3>Centro Histórico: Patrimonio de la Humanidad</h3>
<p>Las casonas coloniales del centro ofrecen oportunidades únicas para hoteles boutique y restaurantes.</p>`,
    content_es: `<h2>Puebla: Historia y Modernidad</h2>
<p>A solo 2 horas de CDMX, Puebla ofrece una alternativa atractiva con precios 40% menores que la capital.</p>
<h3>Angelópolis: El Nuevo Puebla</h3>
<p>Este desarrollo maestro ha transformado la ciudad, atrayendo empresas y residentes de alto nivel.</p>
<h3>Centro Histórico: Patrimonio de la Humanidad</h3>
<p>Las casonas coloniales del centro ofrecen oportunidades únicas para hoteles boutique y restaurantes.</p>`,
    category: "market-insights",
    tags: ["Puebla", "Angelópolis", "centro histórico", "inversión", "patrimonio"],
    meta_title: "Puebla Mercado Inmobiliario 2025 | Angelópolis y Centro Histórico",
    meta_description: "Descubre las oportunidades inmobiliarias en Puebla. Análisis de Angelópolis y el centro histórico patrimonio mundial."
  },
  {
    title: "Tijuana, Mexicali y Ensenada: El Boom de las Ciudades Fronterizas",
    title_es: "Tijuana, Mexicali y Ensenada: El Boom de las Ciudades Fronterizas",
    slug: "ciudades-fronterizas-boom-inmobiliario-2025",
    summary: "Las ciudades fronterizas de Baja California experimentan un crecimiento sin precedentes impulsado por el nearshoring.",
    summary_es: "Las ciudades fronterizas de Baja California experimentan un crecimiento sin precedentes impulsado por el nearshoring.",
    content: `<h2>La Frontera que Crece</h2>
<p>El nearshoring ha convertido a las ciudades fronterizas en imanes para la inversión industrial y residencial.</p>
<h3>Tijuana: La Puerta de América</h3>
<p>Con más de 600 maquiladoras, Tijuana demanda vivienda para miles de trabajadores especializados.</p>
<h3>Mexicali: Capital Industrial</h3>
<p>La llegada de empresas asiáticas ha disparado la demanda de vivienda de nivel medio y alto.</p>
<h3>Ensenada: Puerto y Paraíso</h3>
<p>Combina desarrollo portuario con turismo, ofreciendo diversificación para inversionistas.</p>`,
    content_es: `<h2>La Frontera que Crece</h2>
<p>El nearshoring ha convertido a las ciudades fronterizas en imanes para la inversión industrial y residencial.</p>
<h3>Tijuana: La Puerta de América</h3>
<p>Con más de 600 maquiladoras, Tijuana demanda vivienda para miles de trabajadores especializados.</p>
<h3>Mexicali: Capital Industrial</h3>
<p>La llegada de empresas asiáticas ha disparado la demanda de vivienda de nivel medio y alto.</p>
<h3>Ensenada: Puerto y Paraíso</h3>
<p>Combina desarrollo portuario con turismo, ofreciendo diversificación para inversionistas.</p>`,
    category: "market-insights",
    tags: ["Tijuana", "Mexicali", "Ensenada", "nearshoring", "frontera"],
    meta_title: "Tijuana, Mexicali, Ensenada | Boom Inmobiliario Fronterizo 2025",
    meta_description: "Análisis del boom inmobiliario en las ciudades fronterizas de Baja California impulsado por el nearshoring."
  },
  {
    title: "Oaxaca: Turismo Cultural y Oportunidades Inmobiliarias",
    title_es: "Oaxaca: Turismo Cultural y Oportunidades Inmobiliarias",
    slug: "oaxaca-turismo-cultural-inmobiliario-2025",
    summary: "Oaxaca emerge como destino de inversión para quienes buscan combinar cultura, gastronomía y rentabilidad.",
    summary_es: "Oaxaca emerge como destino de inversión para quienes buscan combinar cultura, gastronomía y rentabilidad.",
    content: `<h2>Oaxaca: La Joya Cultural de México</h2>
<p>Patrimonio de la Humanidad y capital gastronómica, Oaxaca atrae a un turismo sofisticado y consciente.</p>
<h3>Centro Histórico: Inversión con Alma</h3>
<p>Las propiedades en el centro mantienen su valor y generan excelentes rendimientos en renta vacacional.</p>
<h3>Barrios Emergentes</h3>
<p>Xochimilco y Jalatlaco se perfilan como los nuevos hotspots para inversión, con precios aún accesibles.</p>`,
    content_es: `<h2>Oaxaca: La Joya Cultural de México</h2>
<p>Patrimonio de la Humanidad y capital gastronómica, Oaxaca atrae a un turismo sofisticado y consciente.</p>
<h3>Centro Histórico: Inversión con Alma</h3>
<p>Las propiedades en el centro mantienen su valor y generan excelentes rendimientos en renta vacacional.</p>
<h3>Barrios Emergentes</h3>
<p>Xochimilco y Jalatlaco se perfilan como los nuevos hotspots para inversión, con precios aún accesibles.</p>`,
    category: "lifestyle",
    tags: ["Oaxaca", "turismo cultural", "gastronomía", "centro histórico", "inversión"],
    meta_title: "Oaxaca Mercado Inmobiliario 2025 | Inversión en Turismo Cultural",
    meta_description: "Descubre las oportunidades inmobiliarias en Oaxaca, patrimonio mundial y capital gastronómica de México."
  }
];

async function generateSimpleBlogPosts() {
  try {
    console.log('🚀 Starting blog post generation...\n');
    
    const results = {
      successful: [],
      failed: []
    };

    // First, let's check if we need to create categories
    const categories = ['market-insights', 'investment-guide', 'lifestyle'];
    
    for (const categorySlug of categories) {
      try {
        const categoryName = categorySlug.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        await pool.query(`
          INSERT INTO blog_categories (slug, name, description)
          VALUES ($1, $2, $3)
          ON CONFLICT (slug) DO NOTHING
        `, [categorySlug, categoryName, `${categoryName} articles`]);
      } catch (error) {
        console.log(`Category ${categorySlug} might already exist`);
      }
    }

    for (const post of blogPosts) {
      try {
        console.log(`📝 Creating: ${post.title}...`);
        
        const result = await pool.query(`
          INSERT INTO blog_posts (
            slug, title, title_es, summary, summary_es,
            content, content_es, category, tags,
            status, author_id, featured_image_url,
            meta_title, meta_description, published_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9,
            'published', NULL, 'https://source.unsplash.com/800x400/?mexico,real-estate',
            $10, $11, NOW()
          ) RETURNING id, slug, title
        `, [
          post.slug,
          post.title,
          post.title_es,
          post.summary,
          post.summary_es,
          post.content,
          post.content_es,
          post.category,
          post.tags,
          post.meta_title,
          post.meta_description
        ]);
        
        results.successful.push({
          title: result.rows[0].title,
          slug: result.rows[0].slug,
          url: `https://mexican-real-estate-ai-jy2t.vercel.app/blog/${result.rows[0].slug}`
        });
        
        console.log(`✅ Published: ${result.rows[0].title}`);
        console.log(`   URL: https://mexican-real-estate-ai-jy2t.vercel.app/blog/${result.rows[0].slug}\n`);
        
      } catch (error) {
        console.error(`❌ Failed to create post: ${post.title}`, error.message);
        results.failed.push({
          title: post.title,
          error: error.message
        });
      }
    }

    console.log('\n📊 Generation Summary:');
    console.log(`✅ Successfully published: ${results.successful.length} posts`);
    console.log(`❌ Failed: ${results.failed.length} posts`);
    
    if (results.successful.length > 0) {
      console.log('\n📚 Published Blog Posts:');
      results.successful.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   URL: ${post.url}`);
      });
    }

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run the script
generateSimpleBlogPosts();