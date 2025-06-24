# Blog Automation Guide

## 🤖 Automatic Blog Post Generation

### Available Scripts

1. **Generate Single AI Post**
   ```bash
   cd backend
   node src/scripts/generateAIBlogPost.js
   ```
   - Generates one unique blog post using AI
   - Selects random city and topic
   - Uses real market data from your database
   - Publishes immediately

2. **Generate Weekly Posts (3 posts)**
   ```bash
   cd backend
   node src/scripts/weeklyBlogGenerator.js
   ```
   - Generates 3 blog posts at once
   - Spaces them out to avoid rate limits

### How It Works

The AI generator:
1. **Selects Random Topic** from categories:
   - Market Trends
   - Investment Guides
   - Lifestyle Articles
   - Legal/Tax Guides

2. **Picks Random City** from 15 major Mexican cities

3. **Fetches Real Data** from your properties database

4. **Generates Unique Content** using GPT-4:
   - 800-1200 words
   - SEO-optimized
   - Includes local market data
   - HTML formatted

5. **Auto-publishes** with proper tags and images

### Setting Up Automation

#### Option 1: Manual Schedule
Run weekly:
```bash
# Every Monday morning
cd backend && node src/scripts/weeklyBlogGenerator.js
```

#### Option 2: Cron Job (Linux/Mac)
```bash
# Edit crontab
crontab -e

# Add this line to run every Monday at 9 AM
0 9 * * 1 cd /path/to/backend && node src/scripts/generateAIBlogPost.js

# Or run 3 times per week (Mon, Wed, Fri)
0 9 * * 1,3,5 cd /path/to/backend && node src/scripts/generateAIBlogPost.js
```

#### Option 3: GitHub Actions
Create `.github/workflows/blog-generator.yml`:
```yaml
name: Generate Blog Post

on:
  schedule:
    # Run every Monday at 9 AM UTC
    - cron: '0 9 * * 1'
  workflow_dispatch: # Allow manual trigger

jobs:
  generate-post:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: |
          cd backend
          npm install
          node src/scripts/generateAIBlogPost.js
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

#### Option 4: Cloud Functions
Deploy the script to:
- AWS Lambda + CloudWatch Events
- Google Cloud Functions + Cloud Scheduler
- Vercel Cron Jobs
- Render Cron Jobs

### Content Calendar Example

**Weekly Schedule:**
- **Monday**: Market Analysis (trends, prices)
- **Wednesday**: Investment Guide (ROI, opportunities)
- **Friday**: Lifestyle Content (living guides, neighborhoods)

**Monthly Special:**
- First Monday: Quarterly market report
- Mid-month: Legal/tax updates

### Monitoring & Quality

1. **Check Generated Content**
   ```bash
   # View latest posts
   curl https://mexican-real-estate-ai.onrender.com/api/blog/posts?limit=5
   ```

2. **Analytics to Track**
   - Page views per post
   - Most popular cities/topics
   - SEO performance

3. **Content Quality**
   - AI generates unique content each time
   - Uses real market data
   - No duplicate titles (timestamp in slug)

### Cost Considerations

- **OpenAI API**: ~$0.02-0.05 per blog post
- **Database**: Minimal impact
- **Hosting**: No additional cost

### Customization

Edit `generateAIBlogPost.js` to:
- Add new cities
- Create new topic categories
- Adjust content length
- Change writing style
- Add specific market focuses

### Troubleshooting

**If generation fails:**
1. Check OpenAI API key is valid
2. Verify database connection
3. Ensure sufficient API credits
4. Check for rate limits

**To test without publishing:**
Comment out the database insert in `generateAIBlogPost.js` and just console.log the content.