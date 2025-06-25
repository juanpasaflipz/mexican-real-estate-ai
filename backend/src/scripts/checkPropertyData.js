require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const pool = require('../config/database');

async function checkPropertyData() {
  try {
    console.log('Checking property data in database...\n');

    // 1. Overall statistics
    const statsQuery = await pool.query(`
      SELECT 
        COUNT(*) as total_properties,
        COUNT(CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 END) as with_image_url,
        COUNT(CASE WHEN images IS NOT NULL THEN 1 END) as with_images_json,
        COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as with_description,
        COUNT(CASE WHEN features IS NOT NULL AND features != '' THEN 1 END) as with_features
      FROM properties
    `);
    
    console.log('=== Property Data Statistics ===');
    const stats = statsQuery.rows[0];
    console.log(`Total properties: ${stats.total_properties}`);
    console.log(`With image_url: ${stats.with_image_url} (${Math.round(stats.with_image_url/stats.total_properties*100)}%)`);
    console.log(`With images JSON: ${stats.with_images_json} (${Math.round(stats.with_images_json/stats.total_properties*100)}%)`);
    console.log(`With description: ${stats.with_description} (${Math.round(stats.with_description/stats.total_properties*100)}%)`);
    console.log(`With features: ${stats.with_features} (${Math.round(stats.with_features/stats.total_properties*100)}%)`);

    // 2. Sample properties with images
    console.log('\n=== Sample Properties with Images ===');
    const sampleQuery = await pool.query(`
      SELECT 
        id, 
        title, 
        LEFT(description, 100) as description_preview,
        image_url,
        images,
        features,
        city,
        property_type,
        price,
        bedrooms,
        bathrooms,
        area_sqm
      FROM properties
      WHERE image_url IS NOT NULL AND image_url != ''
      LIMIT 5
    `);
    
    sampleQuery.rows.forEach((property, index) => {
      console.log(`\n--- Property ${index + 1} (ID: ${property.id}) ---`);
      console.log(`Title: ${property.title}`);
      console.log(`Type: ${property.property_type} in ${property.city}`);
      console.log(`Price: $${property.price?.toLocaleString()} MXN`);
      console.log(`Details: ${property.bedrooms} beds, ${property.bathrooms} baths, ${property.area_sqm} m²`);
      console.log(`Description: ${property.description_preview ? property.description_preview + '...' : 'No description'}`);
      console.log(`Image URL: ${property.image_url ? 'Yes' : 'No'}`);
      console.log(`Images JSON: ${property.images ? `Yes (${Array.isArray(property.images) ? property.images.length : 0} images)` : 'No'}`);
      console.log(`Features: ${property.features || 'None listed'}`);
    });

    // 3. Check image URL patterns
    console.log('\n=== Image URL Patterns ===');
    const imagePatterns = await pool.query(`
      SELECT 
        CASE 
          WHEN image_url LIKE 'http%' THEN 'HTTP URL'
          WHEN image_url LIKE 'data:image%' THEN 'Base64 Data'
          WHEN image_url = '' THEN 'Empty'
          WHEN image_url IS NULL THEN 'NULL'
          ELSE 'Other'
        END as pattern,
        COUNT(*) as count
      FROM properties
      GROUP BY pattern
      ORDER BY count DESC
    `);
    
    console.table(imagePatterns.rows);

    // 4. Check properties with JSONB images
    console.log('\n=== Properties with JSONB Images ===');
    const jsonbQuery = await pool.query(`
      SELECT 
        id,
        title,
        jsonb_array_length(images) as image_count,
        images->0->>'url' as first_image_url
      FROM properties
      WHERE images IS NOT NULL AND jsonb_typeof(images) = 'array' AND jsonb_array_length(images) > 0
      LIMIT 5
    `);
    
    if (jsonbQuery.rows.length > 0) {
      jsonbQuery.rows.forEach(prop => {
        console.log(`\nProperty ${prop.id}: ${prop.title}`);
        console.log(`Number of images: ${prop.image_count}`);
        console.log(`First image URL: ${prop.first_image_url || 'No URL in first image'}`);
      });
    } else {
      console.log('No properties found with JSONB images array');
    }

    pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\nMake sure you have the correct DATABASE_URL in your .env file');
    }
    pool.end();
  }
}

checkPropertyData();