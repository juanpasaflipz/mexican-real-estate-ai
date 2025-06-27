import axios from 'axios'
import { API_BASE_URL } from '../config/api'

interface Property {
  id: string
  title: string
  lat: number
  lng: number
  price: number
  price_type: 'sale' | 'rent'
  area_m2: number
  bedrooms?: number
  url?: string
  dist_km?: number
}

interface NearbyResponse {
  target: Property
  nearby: Property[]
}

/**
 * Fetch target property and nearby properties within radius
 * @param propertyId - ID of the target property
 * @param radiusKm - Search radius in kilometers
 * @returns Object containing target property and nearby properties
 */
export async function fetchNearbyProperties(
  propertyId: string,
  radiusKm: number
): Promise<NearbyResponse> {
  try {
    // For now, we'll use mock data since the backend endpoint doesn't exist yet
    // In production, this would call: ${API_BASE_URL}/properties/nearby/${propertyId}?radius=${radiusKm}
    
    // Mock data for testing
    const mockTarget: Property = {
      id: propertyId,
      title: 'Beautiful House in Polanco',
      lat: 19.4326,
      lng: -99.1332,
      price: 15000000,
      price_type: 'sale',
      area_m2: 350,
      bedrooms: 4
    }

    // Generate mock nearby properties
    const mockNearby: Property[] = Array.from({ length: 20 }, (_, i) => ({
      id: `property-${i + 1}`,
      title: `Property ${i + 1}`,
      lat: mockTarget.lat + (Math.random() - 0.5) * 0.02,
      lng: mockTarget.lng + (Math.random() - 0.5) * 0.02,
      price: Math.floor(Math.random() * 10000000) + 5000000,
      price_type: Math.random() > 0.5 ? 'sale' : 'rent' as 'sale' | 'rent',
      area_m2: Math.floor(Math.random() * 300) + 100,
      bedrooms: Math.floor(Math.random() * 4) + 1,
      dist_km: Math.random() * radiusKm
    }))

    return {
      target: mockTarget,
      nearby: mockNearby
    }

    // Real implementation would be:
    /*
    const response = await axios.get<NearbyResponse>(
      `${API_BASE_URL}/properties/nearby/${propertyId}`,
      {
        params: { radius: radiusKm }
      }
    )
    return response.data
    */
  } catch (error) {
    console.error('Error fetching nearby properties:', error)
    throw new Error('Failed to fetch nearby properties')
  }
}

/**
 * Alternative: Direct Supabase query (if you want to bypass backend)
 * This would require exposing Supabase credentials to frontend
 */
export async function fetchNearbyPropertiesDirectly(
  propertyId: string,
  radiusKm: number
): Promise<NearbyResponse> {
  // This is just a placeholder showing how you might structure a direct query
  // You would need to set up Supabase client in frontend
  
  /*
  const { data: targetProperty, error: targetError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (targetError) throw targetError

  // For PostGIS query, you'd need to use RPC function
  const { data: nearbyProperties, error: nearbyError } = await supabase
    .rpc('get_nearby_properties', {
      target_lat: targetProperty.lat,
      target_lng: targetProperty.lng,
      radius_km: radiusKm
    })

  if (nearbyError) throw nearbyError

  return {
    target: targetProperty,
    nearby: nearbyProperties
  }
  */

  // For now, return mock data
  return fetchNearbyProperties(propertyId, radiusKm)
}