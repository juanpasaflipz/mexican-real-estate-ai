# Debug API Connection

## Test these URLs directly in your browser:

1. **Health Check**
   ```
   https://mucha-casa-api.onrender.com/health
   ```
   This should return: `{"status":"ok","timestamp":"..."}`

2. **API Base URL**
   ```
   https://mucha-casa-api.onrender.com/api
   ```

3. **Properties Endpoint**
   ```
   https://mucha-casa-api.onrender.com/api/properties/featured/listings?limit=1
   ```

## If you get 404 on all URLs:

### Option 1: Service might still be deploying
- Check Render dashboard → Look for deployment status
- Wait for "Live" status

### Option 2: Service name might not have changed
- The actual URL might still be the old one
- Try: `https://mexican-real-estate-ai.onrender.com/api/properties/featured/listings?limit=1`

### Option 3: Root directory issue
The render.yaml has `rootDir: backend` which might be causing issues.

## Quick Fix Test

Try accessing these URLs and tell me which one works:

1. OLD URL:
   ```
   https://mexican-real-estate-ai.onrender.com/api/properties/featured/listings?limit=1
   ```

2. NEW URL:
   ```
   https://mucha-casa-api.onrender.com/api/properties/featured/listings?limit=1
   ```

3. Without /api prefix:
   ```
   https://mucha-casa-api.onrender.com/properties/featured/listings?limit=1
   ```

## Check Render Logs

1. Go to Render dashboard
2. Click on your service
3. Go to "Logs" tab
4. Look for:
   - "Server running on port..."
   - Any error messages
   - CORS-related logs

Let me know which URL works and I'll update the configuration accordingly!