# Setting Up Geolocation for Nearby Map Feature

## Quick Setup

1. **Add lat/lng columns to your database:**
   ```bash
   cd backend
   node src/scripts/addGeolocationToProperties.js
   ```

2. **Add your Mapbox token to frontend/.env:**
   ```
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

3. **Test the feature:**
   - Start both backend and frontend
   - Navigate to: http://localhost:5173/nearby-map-test

## What This Does

The script will:
- Add `lat` and `lng` columns to the properties table
- Add database indexes for performance
- Add PostGIS geometry column if available
- Populate sample coordinates for major Mexican cities

## Current Status

- ✅ Backend API endpoint created at `/api/properties/:id/nearby`
- ✅ Frontend component ready with real API integration
- ✅ Fallback to basic distance calculation if PostGIS not available
- ✅ Statistics calculation (median prices, price per m²)
- ⚠️ Properties need geocoding (lat/lng coordinates)

## Next Steps

To fully enable this feature:

1. **Geocode existing properties** - Use Google Maps or Mapbox Geocoding API
2. **Add to property detail pages** - Integrate the NearbyMap component
3. **Enable PostGIS** in Supabase for better performance (optional)

## Sample Integration

Add to any property detail page:
```tsx
import { NearbyMap } from '../components/NearbyMap/NearbyMap'

// In your component
<NearbyMap propertyId={property.id} radiusKm={2} />
```