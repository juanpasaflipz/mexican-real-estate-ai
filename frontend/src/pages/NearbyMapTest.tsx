import React, { useState, useEffect } from 'react'
import { NearbyMap } from '../components/NearbyMap/NearbyMap'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

interface PropertyOption {
  id: string
  title: string
  city: string
  lat?: number
  lng?: number
}

const NearbyMapTest: React.FC = () => {
  const [propertyId, setPropertyId] = useState('')
  const [radius, setRadius] = useState(2)
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch properties with coordinates
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/properties`, {
          params: { 
            limit: 100,
            // Only get properties with coordinates (once implemented)
            // hasCoordinates: true 
          }
        })
        
        // For now, use the first few properties
        const propertiesData = response.data.slice(0, 20).map((p: any) => ({
          id: p.id,
          title: p.title || p.address || 'Property ' + p.id,
          city: p.city || 'Unknown',
          lat: p.lat,
          lng: p.lng
        }))
        
        setProperties(propertiesData)
        if (propertiesData.length > 0) {
          setPropertyId(propertiesData[0].id)
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
        // Use sample IDs if API fails
        const sampleProperties = [
          { id: '2', title: 'Casa en Jardines Del Sur', city: 'CDMX' },
          { id: '3', title: 'Casa Porfiriana en Roma Norte', city: 'Roma Norte' },
          { id: '4', title: 'Casa con 3 Departamentos', city: 'Nezahualcoyotl' },
          { id: '5', title: 'Casa con Uso de Suelo', city: 'Iztapalapa' },
          { id: '6', title: 'Casa en Corregidora', city: 'Querétaro' }
        ]
        setProperties(sampleProperties)
        setPropertyId(sampleProperties[0].id)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Nearby Properties Map Test
        </h1>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Map Controls
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Property
              </label>
              {loading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700">
                  Loading properties...
                </div>
              ) : (
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select a property</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.city}
                      {property.lat && property.lng ? ' ✓' : ' (No coordinates)'}
                    </option>
                  ))}
                </select>
              )}
              {propertyId && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Property ID: {propertyId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Radius: {radius} km
              </label>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={radius}
                onChange={(e) => setRadius(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0.5 km</span>
                <span>10 km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Component */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Property Map View
          </h2>
          
          {!import.meta.env.VITE_MAPBOX_TOKEN ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                ⚠️ Mapbox token not configured. Please add VITE_MAPBOX_TOKEN to your .env file.
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                Get your token from: <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="underline">
                  https://account.mapbox.com/access-tokens/
                </a>
              </p>
            </div>
          ) : propertyId ? (
            <NearbyMap propertyId={propertyId} radiusKm={radius} />
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Please select a property from the dropdown above to view nearby properties on the map.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How to use this test page:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200 text-sm">
            <li>The map shows a target property (blue marker) and nearby properties</li>
            <li>Red markers indicate properties for sale</li>
            <li>Green markers indicate properties for rent</li>
            <li>Click on any marker to see property details</li>
            <li>Use the slider to adjust the search radius</li>
            <li>Statistics are shown in the bottom-left corner</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NearbyMapTest