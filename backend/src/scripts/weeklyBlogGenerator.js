require('dotenv').config();
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function generateWeeklyPosts() {
  console.log('📅 Weekly Blog Post Generator\n');
  console.log('This will generate 3 blog posts for the week\n');
  
  const postsToGenerate = 3;
  
  for (let i = 1; i <= postsToGenerate; i++) {
    console.log(`\n📝 Generating post ${i} of ${postsToGenerate}...`);
    console.log('─'.repeat(50));
    
    try {
      // Run the AI generator
      const { stdout } = await execAsync('node src/scripts/generateAIBlogPost.js');
      console.log(stdout);
      
      // Wait between posts to avoid rate limits
      if (i < postsToGenerate) {
        console.log('\n⏳ Waiting 5 seconds before next post...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(`❌ Error generating post ${i}:`, error.message);
    }
  }
  
  console.log('\n✅ Weekly blog generation complete!');
  console.log('📊 Check your blog at: https://mexican-real-estate-ai-jy2t.vercel.app/blog');
}

// Run the weekly generator
generateWeeklyPosts().catch(console.error);