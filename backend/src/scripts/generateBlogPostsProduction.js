require('dotenv').config();
const axios = require('axios');

// Use local API for now
const API_URL = 'http://localhost:3001/api';

const blogTopics = [
  {
    templateType: 'market-analysis',
    parameters: { city: 'Ciudad de México', neighborhoods: ['Polanco', 'Roma Norte', 'Condesa'] }
  },
  {
    templateType: 'market-analysis',
    parameters: { city: 'Guadalajara', neighborhoods: ['Providencia', 'Chapalita', 'Zapopan'] }
  },
  {
    templateType: 'market-analysis',
    parameters: { city: 'Monterrey', neighborhoods: ['San Pedro', 'Valle Oriente', 'Cumbres'] }
  },
  {
    templateType: 'city-comparison',
    parameters: { 
      cities: ['Playa del Carmen', 'Tulum', 'Cancún'],
      focus: 'investment opportunities for international buyers'
    }
  },
  {
    templateType: 'city-comparison',
    parameters: { 
      cities: ['San Miguel de Allende', 'Querétaro', 'Guanajuato'],
      focus: 'retirement destinations for expats'
    }
  },
  {
    templateType: 'market-analysis',
    parameters: { city: 'Mérida', neighborhoods: ['Centro', 'Montejo', 'Norte'] }
  },
  {
    templateType: 'city-comparison',
    parameters: { 
      cities: ['Puerto Vallarta', 'Mazatlán', 'Cabo San Lucas'],
      focus: 'beachfront property investments'
    }
  },
  {
    templateType: 'market-analysis',
    parameters: { city: 'Puebla', neighborhoods: ['Angelópolis', 'La Paz', 'Centro Histórico'] }
  },
  {
    templateType: 'city-comparison',
    parameters: { 
      cities: ['Tijuana', 'Mexicali', 'Ensenada'],
      focus: 'border city real estate opportunities'
    }
  },
  {
    templateType: 'market-analysis',
    parameters: { city: 'Oaxaca', neighborhoods: ['Centro', 'Reforma', 'San Felipe'] }
  }
];

async function generateAllBlogPosts() {
  console.log('🚀 Starting blog post generation for production...\n');
  
  const results = {
    successful: [],
    failed: []
  };

  for (const topic of blogTopics) {
    try {
      const cityName = topic.parameters.city || topic.parameters.cities.join(', ');
      console.log(`📝 Generating ${topic.templateType} for ${cityName}...`);
      
      // Call the production API to generate blog post
      const response = await axios.post(`${API_URL}/blog/generate`, topic, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.post) {
        const post = response.data.post;
        results.successful.push({
          title: post.title,
          slug: post.slug,
          url: `https://mexican-real-estate-ai-jy2t.vercel.app/blog/${post.slug}`
        });
        
        console.log(`✅ Published: ${post.title}`);
        console.log(`   URL: https://mexican-real-estate-ai-jy2t.vercel.app/blog/${post.slug}\n`);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      const cityName = topic.parameters.city || topic.parameters.cities.join(', ');
      console.error(`❌ Failed to generate post for ${cityName}:`, error.response?.data?.error || error.message);
      results.failed.push({
        topic: cityName,
        error: error.response?.data?.error || error.message
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
  
  if (results.failed.length > 0) {
    console.log('\n⚠️  Failed Posts:');
    results.failed.forEach(fail => {
      console.log(`- ${fail.topic}: ${fail.error}`);
    });
  }
}

// Check if axios is installed
try {
  require('axios');
} catch (e) {
  console.error('Please install axios first: npm install axios');
  process.exit(1);
}

// Run the script
generateAllBlogPosts().catch(console.error);