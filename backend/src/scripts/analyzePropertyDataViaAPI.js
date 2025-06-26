const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

async function analyzePropertyData() {
  try {
    console.log('=== ANALYZING PROPERTY DATA STRUCTURE VIA API ===\n');

    // 1. Get properties with complete data
    console.log('Fetching properties with complete data...');
    const completeResponse = await axios.post(`${API_URL}/nlp/query`, {
      query: `
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
      `
    });

    if (completeResponse.data.success && completeResponse.data.data.length > 0) {
      const property = completeResponse.data.data[0];
      console.log('\n=== PROPERTY WITH COMPLETE DATA ===');
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
    }

    // 2. Get properties with minimal data
    console.log('\n\n=== PROPERTY WITH MINIMAL DATA ===');
    const minimalResponse = await axios.post(`${API_URL}/nlp/query`, {
      query: `
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
      `
    });

    if (minimalResponse.data.success && minimalResponse.data.data.length > 0) {
      const property = minimalResponse.data.data[0];
      console.log(`Property ID: ${property.id}`);
      console.log(`Title: ${property.title}`);
      console.log(`Price: $${property.price.toLocaleString()}`);
      console.log(`Location: ${property.address}, ${property.city}, ${property.state}`);
      console.log(`Type: ${property.property_type} (${property.listing_type})`);
      console.log(`Size: ${property.square_meters} m² | ${property.bedrooms} beds | ${property.bathrooms} baths`);
      console.log(`\nDescription: ${property.description || 'NULL'}`);
      console.log(`Images: ${JSON.stringify(property.images) || 'NULL'}`);
      console.log(`Amenities: ${JSON.stringify(property.amenities) || 'NULL'}`);
      console.log(`Features: ${JSON.stringify(property.features) || 'NULL'}`);
    }

    // 3. Analyze JSONB field structures
    console.log('\n\n=== ANALYZING JSONB FIELD STRUCTURES ===');
    
    // Check image field structure
    const imageStructureResponse = await axios.post(`${API_URL}/nlp/query`, {
      query: `
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
      `
    });

    if (imageStructureResponse.data.success) {
      console.log('\nImage field structure distribution:');
      imageStructureResponse.data.data.forEach(row => {
        console.log(`  ${row.images_type || 'NULL'} - ${row.status}: ${row.count} properties`);
      });
    }

    // Get sample image structures
    const imageSamplesResponse = await axios.post(`${API_URL}/nlp/query`, {
      query: `
        SELECT DISTINCT ON (jsonb_array_length(images))
          id,
          images,
          jsonb_array_length(images) as array_length
        FROM properties
        WHERE images IS NOT NULL AND jsonb_array_length(images) > 0
        ORDER BY jsonb_array_length(images), id
        LIMIT 3
      `
    });

    if (imageSamplesResponse.data.success) {
      console.log('\nSample image structures:');
      imageSamplesResponse.data.data.forEach(row => {
        console.log(`\n  Property ${row.id} (${row.array_length} images):`);
        console.log(`  ${JSON.stringify(row.images, null, 2)}`);
      });
    }

    // Check amenities structure
    const amenitiesStructureResponse = await axios.post(`${API_URL}/nlp/query`, {
      query: `
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
      `
    });

    if (amenitiesStructureResponse.data.success) {
      console.log('\n\nAmenities field structure distribution:');
      amenitiesStructureResponse.data.data.forEach(row => {
        console.log(`  ${row.amenities_type || 'NULL'} - ${row.status}: ${row.count} properties`);
      });
    }

    // Get unique amenities sample
    const uniqueAmenitiesResponse = await axios.post(`${API_URL}/nlp/query`, {
      query: `
        SELECT DISTINCT jsonb_array_elements_text(amenities) as amenity
        FROM properties
        WHERE amenities IS NOT NULL
        ORDER BY amenity
        LIMIT 20
      `
    });

    if (uniqueAmenitiesResponse.data.success) {
      console.log('\nSample of unique amenities:');
      uniqueAmenitiesResponse.data.data.forEach(row => {
        console.log(`  - ${row.amenity}`);
      });
    }

  } catch (error) {
    console.error('Error analyzing property data:', error.message);
    if (error.response && error.response.data) {
      console.error('API Error:', error.response.data);
    }
  }
}

analyzePropertyData();