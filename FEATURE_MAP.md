# Feature: “Nearby on Map”

## App context
- Project: **Haus Broker** (Next.js 14, TypeScript, Tailwind CSS).
- DB: Supabase Postgres table `properties`
  - columns: id, title, lat, lng, price, price_type ['sale','rent'], area_m2, status, url …
  - PostGIS enabled (`geom` POINT from lat/lng).
- Map: Mapbox GL JS (env var `MAPBOX_TOKEN` already set).

## Task
1. Create `<NearbyMap propertyId={string} radiusKm={number=2}>` React component.
2. On mount:
   a. Fetch the target row by `propertyId` to get `lat/lng`.  
   b. Call an RPC or SQL (see below) to pull every listing within `radiusKm`.
      ```sql
      select *, 
             ST_DistanceSphere(geom, ST_MakePoint(:lng,:lat))/1000 as dist_km
      from   properties
      where  status='active'
        and  ST_DWithin(geom, ST_MakePoint(:lng,:lat), :radiusKm*1000);
      ```
3. Render the map, centered on the target address, at zoom 15.  
   - Target property → **blue marker**.  
   - `price_type='sale'` → **red marker**.  
   - `price_type='rent'` → **green marker**.
4. For the nearby set compute (in code, not SQL for now):  
   - median sale price (MXN)  
   - median rent price (MXN)  
   - average `price / area_m2` (MXN per m²)  
5. Show those stats in a sticky bottom-left card (Tailwind) with concise labels.
6. Clicking any marker opens a popup with address, price, bedrooms, link to `/listing/[id]`.
7. Files to return:
   - `components/NearbyMap.tsx`
   - `lib/fetchNearby.ts`
   - `supabase/functions/get_nearby.sql`
8. Constraints:
   - Hooks only, no class components.
   - Keep component ≤ 300 LOC, well-typed.
   - Include JSDoc for every function.
   - Dark-mode friendly (Tailwind’s `dark:` classes).

## Output format
Return **only** the full code snippets for the three files, no extra commentary.

## App context
- Project **Haus Broker** (Next.js 14, TypeScript, Tailwind CSS, Zustand for state).
- DB Supabase (Postgres + PostGIS) table `properties`
  - id, title, lat, lng, price, price_type ['sale','rent'], area_m2, status, url …
  - `geom` POINT index.
- Map: Mapbox GL JS (`MAPBOX_TOKEN` env var set).

## Task
1. Create **two** React components:
   - `<NearbyMap propertyId={string}>`
   - `<NearbyControls />` (radius slider, rent/sale checkboxes, info-toggle chips)
2. Global state (Zustand) holds:
   ```ts
   {
     radiusKm: 2,           // user slider 0.5 – 10 km
     showSale: true,
     showRent: true,
     showPriceStats: true,
     showPricePerM2: true
   }