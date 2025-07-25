# Production Environment Variables

## Backend (Render)

The following environment variables must be set in your Render dashboard:

```bash
# Database Configuration (REQUIRED)
DATABASE_URL=postgresql://postgres:T8cBFXxnxe2rvd8aBuWN@db.pfpyfxspinghdhrjalsg.supabase.co:5432/postgres

# OpenAI API Key (REQUIRED for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Frontend URL (REQUIRED for CORS)
CLIENT_URL=https://mexican-real-estate-ai-jy2t.vercel.app

# Server Configuration
NODE_ENV=production
PORT=3001

# Security (auto-generated by Render)
JWT_SECRET=auto-generated-by-render

# Optional
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Frontend (Vercel)

The following environment variables must be set in your Vercel project settings:

```bash
# Backend API URL (REQUIRED)
VITE_API_URL=https://mexican-real-estate-ai.onrender.com/api
```

## Important Notes

1. **Database URL**: Use the Supabase pooler URL if you're having IPv4 connectivity issues on Render
2. **OPENAI_API_KEY**: This is REQUIRED for the AI query features to work
3. **CLIENT_URL**: Must match your Vercel deployment URL exactly for CORS to work
4. **CORS Issues**: The backend has been updated to support multiple origins, but CLIENT_URL should still be set

## Troubleshooting 500 Errors

If you're getting 500 errors on the `/api/nlp/query` endpoint, check:

1. **OPENAI_API_KEY is set correctly** - This is the most common cause
2. **DATABASE_URL is accessible** - Test with the pooler URL if needed
3. **Check Render logs** - Look for specific error messages
4. **CORS errors** - Make sure CLIENT_URL matches your frontend URL

## How to Update Environment Variables

### On Render:
1. Go to your Render dashboard
2. Select your service
3. Go to "Environment" tab
4. Add or update the variables
5. The service will automatically redeploy

### On Vercel:
1. Go to your Vercel project dashboard
2. Go to "Settings" → "Environment Variables"
3. Add or update the variables
4. Redeploy your project for changes to take effect