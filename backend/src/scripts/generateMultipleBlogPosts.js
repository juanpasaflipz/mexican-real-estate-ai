require('dotenv').config();
const BlogGenerationService = require('../services/blogGenerationService');
const db = require('../config/database');

const blogTopics = [
  {
    template: 'market-analysis',
    params: { city: 'Ciudad de México', neighborhoods: ['Polanco', 'Roma Norte', 'Condesa'] }
  },
  {
    template: 'market-analysis',
    params: { city: 'Guadalajara', neighborhoods: ['Providencia', 'Chapalita', 'Zapopan'] }
  },
  {
    template: 'market-analysis',
    params: { city: 'Monterrey', neighborhoods: ['San Pedro', 'Valle Oriente', 'Cumbres'] }
  },
  {
    template: 'city-comparison',
    params: { 
      cities: ['Playa del Carmen', 'Tulum', 'Cancún'],
      focus: 'investment opportunities for international buyers'
    }
  },
  {
    template: 'city-comparison',
    params: { 
      cities: ['San Miguel de Allende', 'Querétaro', 'Guanajuato'],
      focus: 'retirement destinations for expats'
    }
  },
  {
    template: 'market-analysis',
    params: { city: 'Mérida', neighborhoods: ['Centro', 'Montejo', 'Norte'] }
  },
  {
    template: 'city-comparison',
    params: { 
      cities: ['Puerto Vallarta', 'Mazatlán', 'Cabo San Lucas'],
      focus: 'beachfront property investments'
    }
  },
  {
    template: 'market-analysis',
    params: { city: 'Puebla', neighborhoods: ['Angelópolis', 'La Paz', 'Centro Histórico'] }
  },
  {
    template: 'city-comparison',
    params: { 
      cities: ['Tijuana', 'Mexicali', 'Ensenada'],
      focus: 'border city real estate opportunities'
    }
  },
  {
    template: 'market-analysis',
    params: { city: 'Oaxaca', neighborhoods: ['Centro', 'Reforma', 'San Felipe'] }
  }
];

async function generateAllBlogPosts() {
  try {
    console.log('🚀 Starting blog post generation...\n');
    
    const results = {
      successful: [],
      failed: []
    };

    for (const topic of blogTopics) {
      try {
        console.log(`📝 Generating ${topic.template} for ${topic.params.city || topic.params.cities.join(', ')}...`);
        
        const post = await BlogGenerationService.generateBlogPost(topic.template, topic.params);
        
        // Publish immediately
        const publishedPost = await BlogGenerationService.publishDraftPost(post.id);
        
        results.successful.push({
          title: publishedPost.title,
          slug: publishedPost.slug,
          category: publishedPost.category_name
        });
        
        console.log(`✅ Published: ${publishedPost.title}`);
        console.log(`   URL: https://mexican-real-estate-ai-jy2t.vercel.app/blog/${publishedPost.slug}\n`);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Failed to generate/publish post:`, error.message);
        results.failed.push({
          topic: topic.params.city || topic.params.cities.join(', '),
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
        console.log(`   Category: ${post.category}`);
        console.log(`   URL: https://mexican-real-estate-ai-jy2t.vercel.app/blog/${post.slug}`);
      });
    }
    
    if (results.failed.length > 0) {
      console.log('\n⚠️  Failed Posts:');
      results.failed.forEach(fail => {
        console.log(`- ${fail.topic}: ${fail.error}`);
      });
    }

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

// Run the script
generateAllBlogPosts();