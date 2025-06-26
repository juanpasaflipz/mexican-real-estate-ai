# Immediate CORS Fix Steps

## Quick Diagnosis

Run this command to check if the API is responding:
```bash
curl -I https://mucha-casa-api.onrender.com/health
```

If you get a 404 or connection error, the service name might be wrong.

## Option 1: Check Actual Render Service URL

1. Go to Render.com dashboard
2. Look at your backend service
3. Check the actual URL - it might still be:
   - `https://mexican-real-estate-ai.onrender.com`
   - Or some other name

## Option 2: Update Frontend to Use Correct API URL

If your backend is still at the old URL, update the frontend:

1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Update `VITE_API_URL` to the ACTUAL backend URL from Render
4. Redeploy frontend

## Option 3: Quick Frontend Code Fix

If you need an immediate fix, we can temporarily update the frontend to use the working API URL:

```javascript
// In frontend/src/pages/Properties.tsx and other files
const API_URL = 'https://mexican-real-estate-ai.onrender.com/api'; // Use the actual working URL
```

## Test the API Directly

Test which URL is actually working:

```bash
# Test old URL
curl https://mexican-real-estate-ai.onrender.com/api/properties/featured/listings?limit=1

# Test new URL  
curl https://mucha-casa-api.onrender.com/api/properties/featured/listings?limit=1
```

## Most Likely Issue

The Render service is probably still named `mexican-real-estate-ai`, which means:
- API URL is: `https://mexican-real-estate-ai.onrender.com`
- Not: `https://mucha-casa-api.onrender.com`

## Immediate Fix

1. Check your actual Render service URL
2. Update Vercel environment variable `VITE_API_URL` to match
3. Redeploy Vercel frontend

This will fix the issue immediately while you work on renaming the Render service.