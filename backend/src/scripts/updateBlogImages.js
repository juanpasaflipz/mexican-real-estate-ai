require('dotenv').config();
const { Pool } = require('pg');

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Specific Unsplash images for each blog post
const imageUpdates = [
  {
    slug: 'analisis-mercado-inmobiliario-cdmx-2025',
    image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&h=600&fit=crop', // Mexico City skyline
    description: 'Mexico City skyline'
  },
  {
    slug: 'guadalajara-mercado-inmobiliario-inversion-2025',
    image: 'https://images.unsplash.com/photo-1564769610726-63dbdf251303?w=1200&h=600&fit=crop', // Guadalajara cathedral
    description: 'Guadalajara cathedral and city'
  },
  {
    slug: 'monterrey-boom-inmobiliario-2025',
    image: 'https://images.unsplash.com/photo-1590256222840-cfea72e8ad0e?w=1200&h=600&fit=crop', // Monterrey modern buildings
    description: 'Monterrey modern cityscape'
  },
  {
    slug: 'riviera-maya-comparacion-inversion-2025',
    image: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=1200&h=600&fit=crop', // Caribbean beach
    description: 'Riviera Maya beach'
  },
  {
    slug: 'san-miguel-queretaro-retiro-expats-2025',
    image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1200&h=600&fit=crop', // San Miguel de Allende
    description: 'San Miguel de Allende colonial architecture'
  },
  {
    slug: 'merida-ciudad-segura-boom-inmobiliario-2025',
    image: 'https://images.unsplash.com/photo-1585267506852-3bf5615e2d06?w=1200&h=600&fit=crop', // Merida colonial street
    description: 'Merida colonial architecture'
  },
  {
    slug: 'pacifico-mexicano-inversion-playa-2025',
    image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1200&h=600&fit=crop', // Pacific coast beach
    description: 'Mexican Pacific coast'
  },
  {
    slug: 'puebla-mercado-inmobiliario-colonial-2025',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=600&fit=crop', // Puebla cathedral
    description: 'Puebla colonial architecture'
  },
  {
    slug: 'ciudades-fronterizas-boom-inmobiliario-2025',
    image: 'https://images.unsplash.com/photo-1570297502950-e9de6e19c5e9?w=1200&h=600&fit=crop', // Border city aerial
    description: 'Border city development'
  },
  {
    slug: 'oaxaca-turismo-cultural-inmobiliario-2025',
    image: 'https://images.unsplash.com/photo-1518638038630-7b1f5d67f0d5?w=1200&h=600&fit=crop', // Oaxaca colorful buildings
    description: 'Oaxaca traditional architecture'
  }
];

async function updateBlogImages() {
  try {
    console.log('🖼️  Starting blog image updates...\n');
    
    let successCount = 0;
    let failCount = 0;

    for (const update of imageUpdates) {
      try {
        console.log(`📸 Updating image for: ${update.slug}`);
        console.log(`   New image: ${update.description}`);
        
        const result = await pool.query(
          'UPDATE blog_posts SET featured_image_url = $1 WHERE slug = $2 RETURNING id, title',
          [update.image, update.slug]
        );
        
        if (result.rowCount > 0) {
          console.log(`   ✅ Updated: ${result.rows[0].title}\n`);
          successCount++;
        } else {
          console.log(`   ⚠️  No post found with slug: ${update.slug}\n`);
          failCount++;
        }
        
      } catch (error) {
        console.error(`   ❌ Error updating ${update.slug}:`, error.message, '\n');
        failCount++;
      }
    }

    console.log('\n📊 Update Summary:');
    console.log(`✅ Successfully updated: ${successCount} images`);
    console.log(`❌ Failed: ${failCount} images`);
    
    // Show a sample of the updated posts
    console.log('\n🎨 Sample Updated Posts:');
    const sampleResult = await pool.query(`
      SELECT title, slug, featured_image_url 
      FROM blog_posts 
      WHERE featured_image_url LIKE '%images.unsplash.com%'
      LIMIT 3
    `);
    
    sampleResult.rows.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   URL: https://mexican-real-estate-ai-jy2t.vercel.app/blog/${post.slug}`);
      console.log(`   Image: ${post.featured_image_url}\n`);
    });

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run the script
updateBlogImages();