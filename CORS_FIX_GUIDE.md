# CORS Error Fix for www.mucha.casa

## Issue
Getting CORS errors when accessing the site from `https://www.mucha.casa`

## Quick Fix Steps

### 1. Deploy Latest Backend Code
The CORS configuration in the code already includes `https://www.mucha.casa`, but it needs to be deployed:

```bash
git push origin main
```

This will trigger automatic deployment on Render.

### 2. Update Render Environment Variables
1. Go to your Render dashboard
2. Find your `mucha-casa-api` service
3. Go to Environment section
4. Update `CLIENT_URL` to include both domains:
   - Change from: `https://mucha.casa`
   - Change to: `https://www.mucha.casa`
   
   OR if you want to support both:
   - Set it to: `https://www.mucha.casa` (the www version)

### 3. Manual Deploy (if needed)
If auto-deploy is not enabled:
1. Go to Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

### 4. Verify Deployment
After deployment (takes ~5 minutes), test:
```bash
curl -I https://mucha-casa-api.onrender.com/health
```

## Alternative: Temporary Frontend Fix

While waiting for backend deployment, you can access the site without www:
- Use: https://mucha.casa (without www)
- This should work immediately

## Debugging Steps

1. **Check if backend is responding:**
   ```bash
   curl https://mucha-casa-api.onrender.com/health
   ```

2. **Test CORS headers:**
   ```bash
   curl -H "Origin: https://www.mucha.casa" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: X-Requested-With" \
        -X OPTIONS \
        https://mucha-casa-api.onrender.com/api/properties/featured/listings \
        -I
   ```

3. **Check Render logs:**
   - Go to Render dashboard → Logs
   - Look for any CORS-related errors

## Long-term Solution

Consider setting up a redirect from www to non-www (or vice versa) to avoid having to support both:

### Option A: Redirect www → non-www
In Vercel, set up a redirect rule

### Option B: Support both
Keep both in CORS whitelist (current approach)

## Expected Timeline
- Backend deployment: ~5 minutes
- DNS propagation: Already complete
- Total fix time: ~5-10 minutes after deployment