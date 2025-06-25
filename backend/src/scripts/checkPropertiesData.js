require('dotenv').config()
const pool = require('../config/database')

async function checkPropertiesData() {
  try {
    // 1. Get table structure
    console.log('=== PROPERTIES TABLE STRUCTURE ===')
    const columnsQuery = `
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'properties'
      ORDER BY ordinal_position;
    `
    const columnsResult = await pool.query(columnsQuery)
    
    console.log('\nColumns in properties table:')
    console.log('-'.repeat(100))
    columnsResult.rows.forEach(col => {
      console.log(`${col.column_name.padEnd(25)} | ${col.data_type.padEnd(20)} | Nullable: ${col.is_nullable} | Default: ${col.column_default || 'none'}`)
    })

    // 2. Check for image-related columns
    console.log('\n\n=== IMAGE-RELATED COLUMNS ===')
    const imageColumns = columnsResult.rows.filter(col => 
      col.column_name.toLowerCase().includes('image') || 
      col.column_name.toLowerCase().includes('photo') ||
      col.column_name.toLowerCase().includes('picture')
    )
    
    if (imageColumns.length > 0) {
      console.log('Found image columns:')
      imageColumns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`)
      })
    } else {
      console.log('No image-related columns found')
    }

    // 3. Get sample properties with all fields
    console.log('\n\n=== SAMPLE PROPERTY DATA (First 3 records) ===')
    const sampleQuery = `
      SELECT * FROM properties 
      ORDER BY id 
      LIMIT 3;
    `
    const sampleResult = await pool.query(sampleQuery)
    
    sampleResult.rows.forEach((property, index) => {
      console.log(`\n--- Property ${index + 1} (ID: ${property.id}) ---`)
      Object.entries(property).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          console.log(`${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
        }
      })
    })

    // 4. Check for properties with descriptions
    console.log('\n\n=== PROPERTIES WITH DESCRIPTIONS ===')
    const descQuery = `
      SELECT COUNT(*) as total,
        COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as with_description,
        COUNT(CASE WHEN features IS NOT NULL AND features != '' THEN 1 END) as with_features,
        COUNT(CASE WHEN amenities IS NOT NULL THEN 1 END) as with_amenities
      FROM properties;
    `
    const descResult = await pool.query(descQuery)
    const stats = descResult.rows[0]
    
    console.log(`Total properties: ${stats.total}`)
    console.log(`With descriptions: ${stats.with_description} (${((stats.with_description/stats.total)*100).toFixed(1)}%)`)
    console.log(`With features: ${stats.with_features} (${((stats.with_features/stats.total)*100).toFixed(1)}%)`)
    console.log(`With amenities: ${stats.with_amenities} (${((stats.with_amenities/stats.total)*100).toFixed(1)}%)`)

    // 5. Check data types for potential image/array columns
    console.log('\n\n=== ARRAY/JSON COLUMNS ===')
    const arrayColumns = columnsResult.rows.filter(col => 
      col.data_type === 'ARRAY' || 
      col.data_type.includes('json') ||
      col.data_type.includes('[]')
    )
    
    if (arrayColumns.length > 0) {
      console.log('Found array/JSON columns:')
      arrayColumns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`)
      })
    } else {
      console.log('No array/JSON columns found')
    }

    // 6. Sample property with most complete data
    console.log('\n\n=== MOST COMPLETE PROPERTY EXAMPLE ===')
    const completeQuery = `
      SELECT * FROM properties 
      WHERE description IS NOT NULL 
        AND description != ''
        AND features IS NOT NULL
        AND features != ''
      LIMIT 1;
    `
    const completeResult = await pool.query(completeQuery)
    
    if (completeResult.rows.length > 0) {
      const property = completeResult.rows[0]
      console.log(`\nProperty ID: ${property.id}`)
      console.log(`City: ${property.city}, State: ${property.state}`)
      console.log(`Type: ${property.property_type}`)
      console.log(`Price: $${property.price?.toLocaleString()} ${property.currency}`)
      console.log(`\nDescription: ${property.description?.substring(0, 200)}...`)
      console.log(`\nFeatures: ${property.features}`)
      if (property.amenities) {
        console.log(`\nAmenities: ${JSON.stringify(property.amenities)}`)
      }
    } else {
      console.log('No properties found with complete description and features')
    }

  } catch (error) {
    console.error('Error checking properties data:', error)
  } finally {
    await pool.end()
  }
}

checkPropertiesData()