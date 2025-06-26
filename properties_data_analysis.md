# Properties Table Data Analysis

## Database Schema

Based on the analysis of the codebase, the `properties` table contains the following columns:

### Core Property Information
1. **id** (integer, primary key) - Auto-incrementing ID
2. **external_id** (varchar, NOT NULL) - External reference ID from data source
3. **title** (varchar, NOT NULL) - Property listing title
4. **description** (text) - Detailed property description
5. **link** (text) - Original listing URL
6. **url** (text) - Another URL field (possibly for detail page)
7. **source** (varchar, NOT NULL) - Data source identifier

### Pricing Information
8. **price** (varchar) - Property price (stored as string)
9. **currency** (varchar, default: 'MXN') - Currency code

### Location Details
10. **location** (varchar) - General location string
11. **address** (text) - Street address
12. **full_address** (text) - Complete address
13. **neighborhood** (varchar) - Neighborhood/colonia name
14. **city** (varchar) - City name
15. **state** (varchar) - State name
16. **country** (varchar, default: 'Mexico') - Country

### Property Characteristics
17. **property_type** (varchar) - Type of property (house, apartment, etc.)
18. **bedrooms** (integer, default: 0) - Number of bedrooms
19. **bathrooms** (integer, default: 0) - Number of bathrooms
20. **parking_spaces** (integer, default: 0) - Number of parking spaces
21. **property_age** (integer) - Age of property in years

### Size Information
22. **size** (varchar) - General size field
23. **area_sqm** (numeric) - Property area in square meters
24. **total_area_sqm** (numeric) - Total lot area
25. **built_area_sqm** (numeric) - Built/construction area

### Media and Visual Content
26. **image_url** (text) - Primary image URL
27. **images** (jsonb, default: '[]') - Array of image objects with URLs
28. **floor_plan_url** (text) - URL to floor plan image

### Features and Amenities
29. **amenities** (jsonb, default: '[]') - Array of amenity strings
30. **features** (jsonb, default: '{}') - Object with feature details
31. **technical_specs** (jsonb, default: '{}') - Technical specifications

### Metadata and Tracking
32. **created_at** (timestamp) - When record was created
33. **updated_at** (timestamp) - Last update time
34. **last_seen_at** (timestamp) - When property was last seen in source
35. **listing_date** (timestamp with timezone) - Original listing date
36. **last_updated** (timestamp with timezone) - Last data update
37. **publish_date** (timestamp) - Publication date
38. **fetched_at** (timestamp) - When data was fetched
39. **last_scraped_at** (timestamp) - Last scraping timestamp

### Analytics and Status
40. **views** (integer) - View count (deprecated?)
41. **view_count** (integer, default: 0) - Current view counter
42. **detail_scraped** (boolean, default: false) - Whether detailed data has been scraped
43. **seller_type** (varchar) - Type of seller (agency, owner, etc.)
44. **raw_data** (jsonb) - Original raw data from source

## Data Completeness Expectations

Based on the code analysis, here's what we can expect:

### Always Available
- id, external_id, title, source
- Basic location (city, state, country)
- Created/updated timestamps

### Usually Available
- Price (though stored as string, needs parsing)
- Property type
- Bedrooms and bathrooms count
- Primary image (either through image_url or first item in images array)

### Sometimes Available (Requires Detail Scraping)
- Detailed description
- Full address and neighborhood
- Multiple images in the images array
- Amenities list
- Property features
- Size measurements (area_sqm, total_area_sqm, built_area_sqm)
- Parking spaces
- Property age
- Technical specifications

### Special Handling in Code

1. **CDMX Properties**: The system recognizes Ciudad de México and searches across all 16 alcaldías (delegaciones):
   - Cuauhtémoc, Miguel Hidalgo, Benito Juárez, Coyoacán, Tlalpan, Xochimilco, Azcapotzalco, Iztapalapa, Gustavo A. Madero, Álvaro Obregón, Venustiano Carranza, Iztacalco, Tláhuac, Magdalena Contreras, Cuajimalpa, Milpa Alta

2. **Image Selection Priority**: The API uses this logic for primary image:
   ```sql
   CASE 
     WHEN image_url IS NOT NULL AND image_url NOT LIKE 'data:image%' AND image_url != ''
     THEN image_url
     WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
     THEN images->0->>'url'
     ELSE NULL
   END as primary_image
   ```

3. **Property Views Tracking**: The system tracks property views in a separate `property_views` table

## API Endpoints Using Property Data

1. **GET /api/properties** - List properties with filters
   - Returns: id, title, description, price, bedrooms, bathrooms, area_sqm, property_type, address, city, state, neighborhood, features, images, primary_image

2. **GET /api/properties/:id** - Get single property
   - Returns: All fields from properties table plus view_count

3. **GET /api/properties/:id/similar** - Find similar properties
   - Uses: city, price, property_type, bedrooms for matching

4. **GET /api/properties/featured/listings** - Featured properties
   - Orders by: created_at DESC, view_count DESC

5. **POST /api/properties/search** - AI-powered search
   - Uses natural language processing to query properties

## Example Property Structure

Based on the code, a complete property object would look like:

```json
{
  "id": 12345,
  "external_id": "inmuebles24_123456",
  "title": "Hermoso departamento en Polanco",
  "description": "Amplio departamento de lujo con acabados de primera...",
  "price": "8500000",
  "currency": "MXN",
  "property_type": "Departamento",
  "bedrooms": 3,
  "bathrooms": 2,
  "parking_spaces": 2,
  "area_sqm": 180,
  "total_area_sqm": 180,
  "built_area_sqm": 180,
  "property_age": 5,
  "address": "Calle Presidente Masaryk 123",
  "full_address": "Calle Presidente Masaryk 123, Polanco, Miguel Hidalgo, CDMX",
  "neighborhood": "Polanco",
  "city": "Miguel Hidalgo",
  "state": "Ciudad de México",
  "country": "Mexico",
  "images": [
    {"url": "https://example.com/image1.jpg", "alt": "Sala principal"},
    {"url": "https://example.com/image2.jpg", "alt": "Cocina"},
    {"url": "https://example.com/image3.jpg", "alt": "Recámara principal"}
  ],
  "amenities": [
    "Gimnasio",
    "Alberca",
    "Seguridad 24/7",
    "Estacionamiento techado",
    "Áreas verdes"
  ],
  "features": {
    "floors": 2,
    "hasGarden": true,
    "hasBalcony": true,
    "orientation": "Sur"
  },
  "technical_specs": {
    "construction_year": 2019,
    "maintenance_fee": 5000,
    "property_tax": 12000
  },
  "source": "inmuebles24",
  "url": "https://www.inmuebles24.com/propiedades/hermoso-departamento-12345.html",
  "detail_scraped": true,
  "view_count": 234,
  "seller_type": "agency",
  "created_at": "2024-01-15T10:30:00Z",
  "last_scraped_at": "2024-01-20T15:45:00Z"
}
```

## Data Quality Notes

1. **Price Storage**: Prices are stored as strings, which may need parsing for numerical operations
2. **Image Handling**: Multiple image storage options (image_url vs images array)
3. **Location Hierarchy**: Properties may have city names that are actually delegaciones in CDMX
4. **Scraping Status**: The `detail_scraped` flag indicates whether full property details have been fetched
5. **JSONB Fields**: amenities, features, images, and technical_specs use PostgreSQL's JSONB type for flexible schema

## Recommendations for Property Detail Pages

When building property detail pages, prioritize displaying:

1. **Essential Info**: Title, price, location, bedrooms, bathrooms
2. **Visual Content**: Image gallery from the images array
3. **Description**: Full description text if available
4. **Amenities**: List from amenities array
5. **Location Details**: Full address, neighborhood, interactive map
6. **Property Specs**: Size measurements, parking, age
7. **Contact/Action**: Source link, contact form, share buttons

The system appears designed to handle incomplete data gracefully, with many optional fields and fallback options for images and other content.