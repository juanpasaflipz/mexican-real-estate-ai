// Alternative approach using Supabase client
// This might work better if direct PostgreSQL connection is blocked

require('dotenv').config()

async function addCoordinatesViaSupabase() {
  try {
    // Extract Supabase URL and key from DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL
    console.log('DATABASE_URL exists:', !!dbUrl)
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL not found in environment')
    }
    
    // Parse Supabase project reference from URL
    const match = dbUrl.match(/db\.([^.]+)\.supabase\.co/)
    if (!match) {
      throw new Error('Could not parse Supabase project reference from DATABASE_URL')
    }
    
    const projectRef = match[1]
    console.log('Supabase project reference:', projectRef)
    
    console.log('\n📋 Manual Instructions:')
    console.log('Since the database connection is timing out, you can manually add coordinates:')
    console.log('\n1. Go to your Supabase dashboard:')
    console.log(`   https://app.supabase.com/project/${projectRef}/editor`)
    console.log('\n2. Run this SQL in the SQL Editor:')
    
    const sql = `
-- Add lat/lng columns if they don't exist
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS lat NUMERIC,
ADD COLUMN IF NOT EXISTS lng NUMERIC;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_lat ON properties(lat);
CREATE INDEX IF NOT EXISTS idx_properties_lng ON properties(lng);

-- Update some properties with sample coordinates
UPDATE properties SET lat = 19.4326, lng = -99.1332 WHERE id = '2';
UPDATE properties SET lat = 19.4199, lng = -99.1605 WHERE id = '3';
UPDATE properties SET lat = 19.4127, lng = -99.1717 WHERE id = '4';
UPDATE properties SET lat = 19.3574, lng = -99.0889 WHERE id = '5';
UPDATE properties SET lat = 20.5888, lng = -100.3899 WHERE id = '6';
UPDATE properties SET lat = 25.6866, lng = -100.3161 WHERE id = '7';
UPDATE properties SET lat = 20.6597, lng = -103.3496 WHERE id = '8';
UPDATE properties SET lat = 21.1619, lng = -86.8515 WHERE id = '9';
UPDATE properties SET lat = 20.9674, lng = -89.5926 WHERE id = '10';

-- Check results
SELECT id, title, city, lat, lng 
FROM properties 
WHERE lat IS NOT NULL 
LIMIT 10;
`
    
    console.log(sql)
    
    console.log('\n3. After running the SQL, your Nearby Map feature will work with real data!')
    console.log('\n4. Alternative: Install Supabase CLI and run:')
    console.log('   npm install -g supabase')
    console.log('   supabase db remote query --sql "' + sql.split('\n')[3] + '"')
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

addCoordinatesViaSupabase()