import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { fetchNearbyProperties } from '../../utils/fetchNearby'

// Initialize Mapbox token (you'll need to set this in your .env file)
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

if (!mapboxgl.accessToken) {
  console.error('Mapbox token not found! Please set VITE_MAPBOX_TOKEN in your .env file')
} else {
  console.log('Mapbox token loaded, length:', mapboxgl.accessToken.length)
}

interface Property {
  id: string
  title: string
  lat: number
  lng: number
  price: number | string
  price_type?: 'sale' | 'rent'
  area_m2?: number
  area_sqm?: number
  bedrooms?: number
  url?: string
  dist_km?: number
}

interface NearbyMapProps {
  propertyId: string
  radiusKm?: number
}

interface Stats {
  medianSalePrice: number
  medianRentPrice: number
  avgPricePerM2: number
  totalProperties: number
}

/**
 * Component to display nearby properties on a map
 * @param propertyId - ID of the target property to center the map on
 * @param radiusKm - Radius in kilometers to search for nearby properties (default: 2)
 */
export const NearbyMap: React.FC<NearbyMapProps> = ({ propertyId, radiusKm = 2 }) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  // @ts-ignore - Used for marker management
  const markersRef = useRef<mapboxgl.Marker[]>([])
  // @ts-ignore - Used in effect and calculations
  const [targetProperty, setTargetProperty] = useState<Property | null>(null)
  // @ts-ignore - Used in effect and calculations
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeMap = async () => {
      try {
        setLoading(true)
        setError(null) // Clear any previous errors
        
        console.log('Fetching nearby properties for:', propertyId, 'with radius:', radiusKm)
        
        // Fetch target property and nearby properties
        const { target, nearby } = await fetchNearbyProperties(propertyId, radiusKm)
        
        console.log('Received target:', target)
        console.log('Received nearby properties:', nearby?.length || 0)
        
        // Ensure coordinates are numbers
        if (target) {
          target.lat = typeof target.lat === 'string' ? parseFloat(target.lat) : target.lat
          target.lng = typeof target.lng === 'string' ? parseFloat(target.lng) : target.lng
        }
        
        if (nearby) {
          nearby.forEach(p => {
            p.lat = typeof p.lat === 'string' ? parseFloat(p.lat) : p.lat
            p.lng = typeof p.lng === 'string' ? parseFloat(p.lng) : p.lng
          })
        }
        
        setTargetProperty(target)
        setNearbyProperties(nearby)
        
        // Check if we have valid target with coordinates
        if (!target || !target.lat || !target.lng) {
          throw new Error('Target property has no valid coordinates')
        }

        // Calculate stats
        // Since we don't have price_type, just calculate overall stats
        const pricesAsNumbers = nearby
          .map(p => parseFloat(String(p.price).replace(/[^0-9.-]+/g, '')))
          .filter(price => !isNaN(price) && price > 0)
        
        const stats: Stats = {
          medianSalePrice: calculateMedian(pricesAsNumbers), // Use same price for both
          medianRentPrice: 0, // No rent data available
          avgPricePerM2: calculateAvgPricePerM2(nearby),
          totalProperties: nearby.length
        }
        setStats(stats)

        // Initialize map or update existing map
        if (mapContainer.current && target && target.lat && target.lng) {
          console.log('Map instance exists?', !!map.current)
          console.log('Target coordinates:', target.lat, target.lng)
          if (map.current) {
            console.log('Map loaded state:', map.current.loaded())
          }
          
          if (!map.current) {
            // Create new map
            console.log('Creating new map instance')
            map.current = new mapboxgl.Map({
              container: mapContainer.current,
              style: 'mapbox://styles/mapbox/streets-v12',
              center: [target.lng, target.lat],
              zoom: 15
            })

            // Add navigation controls
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
          } else {
            // Update existing map center with animation
            console.log('Updating map center to:', [target.lng, target.lat])
            map.current.flyTo({
              center: [target.lng, target.lat],
              zoom: 15,
              duration: 1000
            })
            
            // After flyTo, the map is already loaded, so we should trigger marker update
            // after the animation completes
            setTimeout(() => {
              console.log('FlyTo animation should be complete, checking loaded state')
              if (map.current && map.current.loaded()) {
                console.log('Map is loaded after flyTo, triggering marker update')
              }
            }, 1100) // Slightly longer than animation duration
          }

          // Function to add markers
          const addMarkers = () => {
            console.log('addMarkers called - target:', target.title, 'nearby count:', nearby.length)
            
            // Remove all existing markers
            const existingMarkers = document.getElementsByClassName('mapboxgl-marker')
            console.log('Removing', existingMarkers.length, 'existing markers')
            while(existingMarkers[0]) {
              existingMarkers[0].remove()
            }

            // Add target property marker (blue)
            console.log('Adding target marker at:', [target.lng, target.lat])
            new mapboxgl.Marker({ color: '#3B82F6' })
              .setLngLat([target.lng, target.lat])
              .setPopup(createPopup(target, true))
              .addTo(map.current!)

            // Add nearby property markers (all red since we don't have price_type)
            console.log('Adding', nearby.length, 'nearby markers')
            nearby.forEach((property, index) => {
              const color = '#EF4444' // Red for all properties
              console.log(`Adding marker ${index + 1} at:`, [property.lng, property.lat])
              new mapboxgl.Marker({ color })
                .setLngLat([property.lng, property.lat])
                .setPopup(createPopup(property))
                .addTo(map.current!)
            })
            
            console.log('Finished adding markers')
          }

          // Add markers when map is ready
          const isNewMap = !mapContainer.current.querySelector('.mapboxgl-canvas')
          
          if (isNewMap) {
            // New map, wait for load event
            console.log('New map created, waiting for load event')
            map.current.once('load', () => {
              console.log('Map load event fired, adding markers')
              addMarkers()
            })
          } else {
            // Existing map, add markers after flyTo completes
            console.log('Existing map, adding markers after flyTo')
            if (map.current.loaded()) {
              // If already loaded, wait for flyTo to complete
              map.current.once('moveend', () => {
                console.log('Map moveend event fired, adding markers')
                addMarkers()
              })
            } else {
              // Fallback: add markers immediately
              console.log('Adding markers immediately as fallback')
              setTimeout(addMarkers, 100)
            }
          }
        } else {
          console.log('Missing requirements for map update:', {
            container: !!mapContainer.current,
            target: !!target,
            targetLat: target?.lat,
            targetLng: target?.lng
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map')
      } finally {
        setLoading(false)
      }
    }

    initializeMap()

    // Cleanup only on component unmount, not on property change
    return () => {
      // Don't remove map here, only on component unmount
    }
  }, [propertyId, radiusKm])
  
  // Separate cleanup effect for component unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  /**
   * Calculate median value from array of numbers
   */
  const calculateMedian = (values: number[]): number => {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  }

  /**
   * Calculate average price per square meter
   */
  const calculateAvgPricePerM2 = (properties: Property[]): number => {
    const validProperties = properties.filter(p => {
      const price = parseFloat(String(p.price).replace(/[^0-9.-]+/g, ''))
      const area = p.area_m2 || p.area_sqm || 0
      return !isNaN(price) && price > 0 && area > 0
    })
    if (validProperties.length === 0) return 0
    const total = validProperties.reduce((sum, p) => {
      const price = parseFloat(String(p.price).replace(/[^0-9.-]+/g, ''))
      const area = p.area_m2 || p.area_sqm || 1
      return sum + (price / area)
    }, 0)
    return total / validProperties.length
  }

  /**
   * Create popup content for markers
   */
  const createPopup = (property: Property, isTarget = false): mapboxgl.Popup => {
    const content = `
      <div class="p-2 min-w-[200px]">
        <h3 class="font-bold text-sm mb-1">${property.title || 'Property'}</h3>
        ${isTarget ? '<span class="text-xs text-blue-600 font-semibold">Target Property</span>' : ''}
        <p class="text-sm">Price: ${property.price}</p>
        ${property.bedrooms ? `<p class="text-sm">Bedrooms: ${property.bedrooms}</p>` : ''}
        ${property.area_m2 || property.area_sqm ? `<p class="text-sm">Area: ${property.area_m2 || property.area_sqm} m²</p>` : ''}
        ${property.dist_km ? `<p class="text-sm">Distance: ${parseFloat(property.dist_km.toString()).toFixed(1)} km</p>` : ''}
        <a href="/properties/${property.id}" class="text-blue-600 text-sm hover:underline">View Details</a>
      </div>
    `
    return new mapboxgl.Popup({ offset: 25 }).setHTML(content)
  }

  /**
   * Format currency for display
   */
  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString()} MXN`
  }

  return (
    <div className="relative h-[600px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 dark:bg-gray-800/90 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 dark:bg-red-900/20 z-10">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          </div>
        </div>
      )}
      
      {/* Stats Card */}
      {stats && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-bold text-sm mb-2 text-gray-900 dark:text-gray-100">
            Nearby Properties ({radiusKm}km radius)
          </h3>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              Total Properties: <span className="font-semibold">{stats.totalProperties}</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Median Price: <span className="font-semibold text-red-600">{formatCurrency(stats.medianSalePrice)}</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Avg Price/m²: <span className="font-semibold">{formatCurrency(Math.round(stats.avgPricePerM2))}</span>
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
        <h4 className="font-semibold text-xs mb-2 text-gray-900 dark:text-gray-100">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-700 dark:text-gray-300">Target Property</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-700 dark:text-gray-300">Nearby Properties</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NearbyMap