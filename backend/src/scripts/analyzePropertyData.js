require('dotenv').config();
const { Pool } = require('pg');

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function analyzePropertyData() {
  try {
    console.log('=== ANALYZING PROPERTY DATA STRUCTURE ===\n');

    // 1. Find a property with the most complete data
    const completeQuery = `
      SELECT 
        p.*,
        jsonb_array_length(COALESCE(p.images, '[]'::jsonb)) as image_count,
        jsonb_array_length(COALESCE(p.amenities, '[]'::jsonb)) as amenity_count,
        LENGTH(COALESCE(p.description, '')) as description_length
      FROM properties p
      WHERE 
        p.images IS NOT NULL 
        AND jsonb_array_length(p.images) > 0
        AND p.amenities IS NOT NULL 
        AND jsonb_array_length(p.amenities) > 0
        AND p.description IS NOT NULL 
        AND LENGTH(p.description) > 100
      ORDER BY 
        jsonb_array_length(p.images) DESC,
        jsonb_array_length(p.amenities) DESC,
        LENGTH(p.description) DESC
      LIMIT 1
    `;

    const completeResult = await pool.query(completeQuery);
    
    if (completeResult.rows.length > 0) {
      const property = completeResult.rows[0];
      console.log('=== PROPERTY WITH COMPLETE DATA ===');
      console.log(`Property ID: ${property.id}`);
      console.log(`Title: ${property.title}`);
      console.log(`Price: $${property.price.toLocaleString()}`);
      console.log(`Location: ${property.address}, ${property.city}, ${property.state}`);
      console.log(`Type: ${property.property_type} (${property.listing_type})`);
      console.log(`Size: ${property.square_meters} m² | ${property.bedrooms} beds | ${property.bathrooms} baths`);
      console.log(`\nDescription (${property.description_length} chars):`);
      console.log(`${property.description.substring(0, 200)}...`);
      console.log(`\nImages (${property.image_count} total):`);
      console.log(JSON.stringify(property.images, null, 2));
      console.log(`\nAmenities (${property.amenity_count} total):`);
      console.log(JSON.stringify(property.amenities, null, 2));
      if (property.features) {
        console.log(`\nFeatures:`);
        console.log(JSON.stringify(property.features, null, 2));
      }
    } else {
      console.log('No properties found with complete data');
    }

    // 2. Find a property with minimal data
    console.log('\n\n=== PROPERTY WITH MINIMAL DATA ===');
    const minimalQuery = `
      SELECT 
        p.*,
        jsonb_array_length(COALESCE(p.images, '[]'::jsonb)) as image_count,
        jsonb_array_length(COALESCE(p.amenities, '[]'::jsonb)) as amenity_count,
        LENGTH(COALESCE(p.description, '')) as description_length
      FROM properties p
      WHERE 
        (p.images IS NULL OR jsonb_array_length(COALESCE(p.images, '[]'::jsonb)) = 0)
        AND (p.amenities IS NULL OR jsonb_array_length(COALESCE(p.amenities, '[]'::jsonb)) = 0)
        AND (p.description IS NULL OR LENGTH(COALESCE(p.description, '')) < 50)
      LIMIT 1
    `;

    const minimalResult = await pool.query(minimalQuery);
    
    if (minimalResult.rows.length > 0) {
      const property = minimalResult.rows[0];
      console.log(`Property ID: ${property.id}`);
      console.log(`Title: ${property.title}`);
      console.log(`Price: $${property.price.toLocaleString()}`);
      console.log(`Location: ${property.address}, ${property.city}, ${property.state}`);
      console.log(`Type: ${property.property_type} (${property.listing_type})`);
      console.log(`Size: ${property.square_meters} m² | ${property.bedrooms} beds | ${property.bathrooms} baths`);
      console.log(`\nDescription: ${property.description || 'NULL'}`);
      console.log(`Images: ${property.images || 'NULL'}`);
      console.log(`Amenities: ${property.amenities || 'NULL'}`);
      console.log(`Features: ${property.features || 'NULL'}`);
    }

    // 3. Analyze the structure of images and amenities fields
    console.log('\n\n=== ANALYZING JSONB FIELD STRUCTURES ===');
    
    // Check different image structures
    const imageStructureQuery = `
      SELECT DISTINCT
        jsonb_typeof(images) as images_type,
        CASE 
          WHEN images IS NULL THEN 'NULL'
          WHEN jsonb_array_length(images) = 0 THEN 'Empty Array'
          ELSE 'Has Data'
        END as status,
        COUNT(*) as count
      FROM properties
      GROUP BY jsonb_typeof(images), status
      ORDER BY count DESC
    `;

    const imageStructureResult = await pool.query(imageStructureQuery);
    console.log('\nImage field structure distribution:');
    imageStructureResult.rows.forEach(row => {
      console.log(`  ${row.images_type || 'NULL'} - ${row.status}: ${row.count} properties`);
    });

    // Sample of actual image data structures
    const imageSamplesQuery = `
      SELECT DISTINCT ON (jsonb_array_length(images))
        id,
        images,
        jsonb_array_length(images) as array_length
      FROM properties
      WHERE images IS NOT NULL AND jsonb_array_length(images) > 0
      ORDER BY jsonb_array_length(images), id
      LIMIT 3
    `;

    const imageSamplesResult = await pool.query(imageSamplesQuery);
    console.log('\nSample image structures:');
    imageSamplesResult.rows.forEach(row => {
      console.log(`\n  Property ${row.id} (${row.array_length} images):`);
      console.log(`  ${JSON.stringify(row.images, null, 2)}`);
    });

    // Check amenities structure
    const amenitiesStructureQuery = `
      SELECT DISTINCT
        jsonb_typeof(amenities) as amenities_type,
        CASE 
          WHEN amenities IS NULL THEN 'NULL'
          WHEN jsonb_array_length(amenities) = 0 THEN 'Empty Array'
          ELSE 'Has Data'
        END as status,
        COUNT(*) as count
      FROM properties
      GROUP BY jsonb_typeof(amenities), status
      ORDER BY count DESC
    `;

    const amenitiesStructureResult = await pool.query(amenitiesStructureQuery);
    console.log('\n\nAmenities field structure distribution:');
    amenitiesStructureResult.rows.forEach(row => {
      console.log(`  ${row.amenities_type || 'NULL'} - ${row.status}: ${row.count} properties`);
    });

    // Get unique amenities
    const uniqueAmenitiesQuery = `
      SELECT DISTINCT jsonb_array_elements_text(amenities) as amenity
      FROM properties
      WHERE amenities IS NOT NULL
      ORDER BY amenity
      LIMIT 20
    `;

    const uniqueAmenitiesResult = await pool.query(uniqueAmenitiesQuery);
    console.log('\nSample of unique amenities:');
    uniqueAmenitiesResult.rows.forEach(row => {
      console.log(`  - ${row.amenity}`);
    });

    // Check for any properties with non-array JSONB fields
    const nonArrayCheckQuery = `
      SELECT 
        id,
        CASE WHEN jsonb_typeof(images) != 'array' THEN images ELSE NULL END as non_array_images,
        CASE WHEN jsonb_typeof(amenities) != 'array' THEN amenities ELSE NULL END as non_array_amenities
      FROM properties
      WHERE 
        (images IS NOT NULL AND jsonb_typeof(images) != 'array')
        OR (amenities IS NOT NULL AND jsonb_typeof(amenities) != 'array')
      LIMIT 5
    `;

    const nonArrayResult = await pool.query(nonArrayCheckQuery);
    if (nonArrayResult.rows.length > 0) {
      console.log('\n\nWARNING: Found properties with non-array JSONB fields:');
      nonArrayResult.rows.forEach(row => {
        console.log(`  Property ${row.id}:`);
        if (row.non_array_images) console.log(`    Images: ${JSON.stringify(row.non_array_images)}`);
        if (row.non_array_amenities) console.log(`    Amenities: ${JSON.stringify(row.non_array_amenities)}`);
      });
    } else {
      console.log('\n\nGood: All JSONB fields are properly formatted as arrays.');
    }

  } catch (error) {
    console.error('Error analyzing property data:', error);
  } finally {
    await pool.end();
  }
}

analyzePropertyData();