import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { fetchNearbyProperties } from '../../utils/fetchNearby'

// Initialize Mapbox token (you'll need to set this in your .env file)
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

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
  const [targetProperty, setTargetProperty] = useState<Property | null>(null)
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeMap = async () => {
      try {
        setLoading(true)
        
        // Fetch target property and nearby properties
        const { target, nearby } = await fetchNearbyProperties(propertyId, radiusKm)
        setTargetProperty(target)
        setNearbyProperties(nearby)

        // Calculate stats
        const saleProperties = nearby.filter(p => p.price_type === 'sale')
        const rentProperties = nearby.filter(p => p.price_type === 'rent')
        
        const stats: Stats = {
          medianSalePrice: calculateMedian(saleProperties.map(p => p.price)),
          medianRentPrice: calculateMedian(rentProperties.map(p => p.price)),
          avgPricePerM2: calculateAvgPricePerM2(nearby),
          totalProperties: nearby.length
        }
        setStats(stats)

        // Initialize map
        if (mapContainer.current && !map.current) {
          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [target.lng, target.lat],
            zoom: 15
          })

          // Add navigation controls
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

          // Wait for map to load
          map.current.on('load', () => {
            // Add target property marker (blue)
            new mapboxgl.Marker({ color: '#3B82F6' })
              .setLngLat([target.lng, target.lat])
              .setPopup(createPopup(target, true))
              .addTo(map.current!)

            // Add nearby property markers
            nearby.forEach(property => {
              const color = property.price_type === 'sale' ? '#EF4444' : '#10B981'
              new mapboxgl.Marker({ color })
                .setLngLat([property.lng, property.lat])
                .setPopup(createPopup(property))
                .addTo(map.current!)
            })
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map')
      } finally {
        setLoading(false)
      }
    }

    initializeMap()

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [propertyId, radiusKm])

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
    const validProperties = properties.filter(p => p.area_m2 > 0)
    if (validProperties.length === 0) return 0
    const total = validProperties.reduce((sum, p) => sum + (p.price / p.area_m2), 0)
    return total / validProperties.length
  }

  /**
   * Create popup content for markers
   */
  const createPopup = (property: Property, isTarget = false): mapboxgl.Popup => {
    const content = `
      <div class="p-2 min-w-[200px]">
        <h3 class="font-bold text-sm mb-1">${property.title}</h3>
        ${isTarget ? '<span class="text-xs text-blue-600 font-semibold">Target Property</span>' : ''}
        <p class="text-sm">Price: $${property.price.toLocaleString()} MXN</p>
        <p class="text-sm">Type: ${property.price_type === 'sale' ? 'For Sale' : 'For Rent'}</p>
        ${property.bedrooms ? `<p class="text-sm">Bedrooms: ${property.bedrooms}</p>` : ''}
        ${property.dist_km ? `<p class="text-sm">Distance: ${property.dist_km.toFixed(1)} km</p>` : ''}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[600px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      
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
              Median Sale Price: <span className="font-semibold text-red-600">{formatCurrency(stats.medianSalePrice)}</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Median Rent Price: <span className="font-semibold text-green-600">{formatCurrency(stats.medianRentPrice)}</span>
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
            <span className="text-xs text-gray-700 dark:text-gray-300">For Sale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-700 dark:text-gray-300">For Rent</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NearbyMap