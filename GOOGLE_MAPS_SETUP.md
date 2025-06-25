# Google Maps API Setup Guide

## Getting Your API Key

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable these APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API (optional, for address search)

3. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

4. **Restrict Your API Key (Important for production)**
   - Click on your API key
   - Under "Application restrictions":
     - Select "HTTP referrers"
     - Add these URLs:
       - `http://localhost:*/*` (for development)
       - `https://mexican-real-estate-ai-jy2t.vercel.app/*` (for production)
   - Under "API restrictions":
     - Select "Restrict key"
     - Check: Maps JavaScript API, Places API

5. **Add to Your Environment Files**

   In `/frontend/.env.local`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

   In Vercel Dashboard:
   - Go to Settings → Environment Variables
   - Add: `VITE_GOOGLE_MAPS_API_KEY` with your API key

## Billing

- Google provides $200/month free credit
- Monitor usage in Cloud Console → Billing
- Set up billing alerts to avoid surprises

## Testing

1. Start the frontend: `npm run dev`
2. Navigate to http://localhost:5173/map
3. The map should load with property markers

## Troubleshooting

- **"This page can't load Google Maps correctly"**
  - Check if API key is set in environment
  - Verify APIs are enabled in Cloud Console
  - Check domain restrictions

- **No markers showing**
  - Verify properties have latitude/longitude values
  - Check browser console for errors