# Google OAuth Setup Guide

## Setting up Google OAuth for Mexican Real Estate Platform

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Name it something like "Mexican Real Estate Platform"

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: "Mexican Real Estate Platform"
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `email` and `profile`
   - Add test users if in development

4. After consent screen is configured, create OAuth client ID:
   - Application type: "Web application"
   - Name: "Mexican Real Estate Web Client"
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     http://localhost:5174
     http://localhost:5175
     https://mexican-real-estate-ai-jy2t.vercel.app
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3001/api/auth/google/callback
     https://mexican-real-estate-ai.onrender.com/api/auth/google/callback
     ```

5. Click "Create"
6. Copy the Client ID and Client Secret

### 4. Update Environment Variables

Update your `.env` file with the credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-client-secret
```

### 5. Update Production Environment

For production deployment:

**On Render (Backend):**
- Add `GOOGLE_CLIENT_ID` environment variable
- Add `GOOGLE_CLIENT_SECRET` environment variable
- Add `SESSION_SECRET` with a secure random string
- Update `API_URL` to `https://mexican-real-estate-ai.onrender.com`

**On Vercel (Frontend):**
- No additional environment variables needed for OAuth

### 6. Test the Integration

1. Start your backend: `npm run dev`
2. Start your frontend: `npm run dev`
3. Navigate to login page
4. Click "Sign in with Google"
5. Complete the OAuth flow

### Security Notes

1. **Never commit** the `.env` file with real credentials
2. Keep your Google Client Secret secure
3. Use different OAuth apps for development and production
4. Regularly rotate your session secrets
5. Monitor OAuth usage in Google Cloud Console

### Troubleshooting

**"Redirect URI mismatch" error:**
- Ensure the redirect URI exactly matches what's in Google Console
- Check for trailing slashes
- Verify protocol (http vs https)

**"Access blocked" error:**
- Make sure Google+ API is enabled
- Check OAuth consent screen is properly configured
- Verify test users are added (if in development)

**Session issues:**
- Ensure `SESSION_SECRET` is set
- Check cookie settings match your environment (secure for HTTPS)