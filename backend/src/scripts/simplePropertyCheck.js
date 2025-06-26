require('dotenv').config();
const { Pool } = require('pg');

// Try both connection strings
const connectionStrings = [
  process.env.DATABASE_URL,
  process.env.SUPABASE_DATABASE_URL,
  // Try with pooler subdomain (common pattern for Supabase pooling)
  process.env.DATABASE_URL?.replace('db.', 'pooler.'),
  // Try transaction mode pooler (port 6543)
  process.env.DATABASE_URL?.replace(':5432', ':6543'),
  // Try session mode pooler (port 5432 but different host)
  process.env.DATABASE_URL?.replace('db.', 'aws-0-us-east-1.pooler.')
];

async function testConnection(connectionString, label) {
  if (!connectionString) return;
  
  console.log(`\nTesting ${label}: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    // Test basic connection
    const result = await pool.query('SELECT COUNT(*) as count FROM properties LIMIT 1');
    console.log(`✅ SUCCESS: Found ${result.rows[0].count} properties`);
    
    // Get a sample property with data
    const sampleQuery = `
      SELECT 
        id, title, city, state, price,
        jsonb_array_length(COALESCE(images, '[]'::jsonb)) as image_count,
        jsonb_array_length(COALESCE(amenities, '[]'::jsonb)) as amenity_count
      FROM properties 
      WHERE images IS NOT NULL 
      ORDER BY jsonb_array_length(images) DESC 
      LIMIT 1
    `;
    
    const sampleResult = await pool.query(sampleQuery);
    if (sampleResult.rows.length > 0) {
      const prop = sampleResult.rows[0];
      console.log(`Sample property: ${prop.title} in ${prop.city}, ${prop.state}`);
      console.log(`Images: ${prop.image_count}, Amenities: ${prop.amenity_count}`);
    }
    
    await pool.end();
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    await pool.end();
    return false;
  }
}

async function main() {
  console.log('Testing database connections...');
  
  let connected = false;
  for (let i = 0; i < connectionStrings.length; i++) {
    if (connectionStrings[i]) {
      const success = await testConnection(connectionStrings[i], `Connection ${i + 1}`);
      if (success) {
        connected = true;
        console.log(`\n✅ Use connection string #${i + 1} for IPv4 connectivity`);
        break;
      }
    }
  }
  
  if (!connected) {
    console.log('\n❌ All connection attempts failed. You may need:');
    console.log('1. The Supabase pooler connection string (from Dashboard > Settings > Database)');
    console.log('2. To check if your IP is allowed in Supabase network restrictions');
    console.log('3. To enable the IPv4 add-on in Supabase (for direct connections)');
  }
}

main().catch(console.error);