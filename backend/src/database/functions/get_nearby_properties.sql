-- Function to get nearby properties within a radius
-- Requires PostGIS extension to be enabled in Supabase

-- First, ensure we have a geometry column if not already present
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);
-- UPDATE properties SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326) WHERE geom IS NULL;
-- CREATE INDEX IF NOT EXISTS idx_properties_geom ON properties USING GIST (geom);

-- Create the function
CREATE OR REPLACE FUNCTION get_nearby_properties(
  target_property_id UUID,
  radius_km NUMERIC DEFAULT 2
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  address TEXT,
  lat NUMERIC,
  lng NUMERIC,
  price NUMERIC,
  price_type TEXT,
  area_m2 NUMERIC,
  bedrooms INTEGER,
  bathrooms NUMERIC,
  property_type TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  description TEXT,
  url TEXT,
  image_url TEXT,
  dist_km NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  target_lat NUMERIC;
  target_lng NUMERIC;
  target_geom geometry;
BEGIN
  -- Get the target property coordinates
  SELECT properties.lat, properties.lng, properties.geom
  INTO target_lat, target_lng, target_geom
  FROM properties
  WHERE properties.id = target_property_id;
  
  -- If no geometry column exists, create point from lat/lng
  IF target_geom IS NULL THEN
    target_geom := ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326);
  END IF;
  
  -- Return nearby properties
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.address,
    p.lat,
    p.lng,
    p.price,
    p.price_type,
    p.area_m2,
    p.bedrooms,
    p.bathrooms,
    p.property_type,
    p.city,
    p.state,
    p.country,
    p.description,
    p.url,
    p.image_url,
    -- Calculate distance in kilometers
    ROUND((ST_DistanceSphere(
      COALESCE(p.geom, ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326)),
      target_geom
    ) / 1000)::NUMERIC, 2) as dist_km
  FROM properties p
  WHERE 
    -- Exclude the target property itself
    p.id != target_property_id
    -- Only active properties (adjust based on your schema)
    -- AND p.status = 'active'
    -- Within radius (using ST_DWithin for performance)
    AND ST_DWithin(
      COALESCE(p.geom, ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326))::geography,
      target_geom::geography,
      radius_km * 1000  -- Convert km to meters
    )
  ORDER BY dist_km ASC
  LIMIT 100;  -- Limit results for performance
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_nearby_properties TO authenticated;
GRANT EXECUTE ON FUNCTION get_nearby_properties TO anon;

-- Example usage:
-- SELECT * FROM get_nearby_properties('property-uuid-here', 2.5);