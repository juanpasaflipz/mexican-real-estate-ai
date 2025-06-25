# Authentication Flow Test Results

## Issue Summary
The page goes blank after login at http://localhost:5175/login

## Root Causes Found:
1. **Port Mismatch**: Frontend is running on port 5173, but auth routes were expecting 5175
2. **Incorrect OAuth URL**: Login was redirecting to `/auth/google` instead of `/api/auth/google`

## Fixes Applied:

### 1. Fixed OAuth Redirect URL in AuthContext
Changed from:
```javascript
window.location.href = '/auth/google';
```
To:
```javascript
window.location.href = '/api/auth/google';
```

### 2. Updated Frontend Port in Auth Routes
Changed default frontend URL from `http://localhost:5175` to `http://localhost:5173`

## Current Authentication Flow:
1. User clicks "Sign in with Google" on login page
2. Browser redirects to `/api/auth/google`
3. Express server handles this route and redirects to Google OAuth
4. Google redirects back to `/api/auth/google/callback`
5. Server processes the callback and redirects to frontend `/auth/callback` with tokens
6. Frontend AuthCallback component stores tokens and redirects to home page

## Configuration Verified:
- ✅ Google OAuth credentials are set in .env
- ✅ CORS allows both ports 5173 and 5175
- ✅ Passport.js is properly configured
- ✅ Auth routes are mounted at `/api/auth`
- ✅ Frontend proxy is configured to forward `/api` requests to backend

## To Test:
1. Make sure both servers are running:
   - Backend: http://localhost:3001
   - Frontend: http://localhost:5173
2. Visit http://localhost:5173/login
3. Click "Continuar con Google"
4. Complete Google OAuth flow
5. You should be redirected back to the home page logged in

## Additional Notes:
- The frontend Vite config uses port 5173 by default
- The proxy configuration in vite.config.ts forwards `/api` requests to the backend
- Make sure Google OAuth app has the correct redirect URIs configured in Google Cloud Console