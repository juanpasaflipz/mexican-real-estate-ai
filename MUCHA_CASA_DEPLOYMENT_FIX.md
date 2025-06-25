# Mucha Casa - Properties Display Fix

## Issue
The mucha.casa domain is not showing properties. This is likely due to:
1. Environment variables not updated in production
2. API URL mismatch between frontend and backend

## Solution Steps

### 1. Update Vercel Environment Variables (Frontend)
Go to your Vercel project dashboard and update:
- `VITE_API_URL` = `https://mucha-casa-api.onrender.com/api`

### 2. Verify Render Service Name (Backend)
Make sure your Render service is named `mucha-casa-api` (not the old name)

### 3. Rebuild and Redeploy

#### Option A: Through Git Push
```bash
git add -A
git commit -m "Fix production API URL for properties endpoint"
git push
```

#### Option B: Manual Redeploy
- **Vercel**: Go to project → Deployments → Redeploy
- **Render**: Go to service → Manual Deploy → Deploy latest commit

### 4. Clear Browser Cache
After deployment, clear your browser cache or test in incognito mode.

## Testing

1. Visit https://mucha.casa/properties
2. Check browser console for any API errors
3. Verify network tab shows requests to correct API URL

## Quick Checks

### Frontend API URL
The frontend should make requests to:
- Development: `http://localhost:3001/api/properties`
- Production: `https://mucha-casa-api.onrender.com/api/properties`

### Backend CORS
Already configured to allow:
- `https://mucha.casa`
- `https://www.mucha.casa`

### API Endpoints Available
- `GET /api/properties` - List all properties with pagination
- `GET /api/properties/:id` - Get single property
- `GET /api/properties/featured/listings` - Get featured properties
- `POST /api/properties/search` - AI-powered search

## Alternative Quick Fix

If you need properties to show immediately, you can:
1. Navigate to https://mucha.casa/ai-search
2. Use the AI chat to search for properties
3. This uses a different endpoint that might still be working

## Debug Commands

To check if the API is working:
```bash
# Test API health
curl https://mucha-casa-api.onrender.com/health

# Test properties endpoint
curl https://mucha-casa-api.onrender.com/api/properties?limit=10
```

## Next Steps After Fix

1. Verify all pages work:
   - Home page (/)
   - Properties page (/properties)
   - Individual property pages (/properties/[id])
   - Map search (/map)
   - AI Search (/ai-search)
   - Blog (/blog)

2. Update any remaining references to old domain in:
   - Marketing materials
   - Social media
   - Email signatures
   - Documentation