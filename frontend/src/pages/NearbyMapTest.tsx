import React, { useState } from 'react'
import { NearbyMap } from '../components/NearbyMap/NearbyMap'

const NearbyMapTest: React.FC = () => {
  const [propertyId, setPropertyId] = useState('test-property-1')
  const [radius, setRadius] = useState(2)

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
                Property ID
              </label>
              <input
                type="text"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter property ID"
              />
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
          ) : (
            <NearbyMap propertyId={propertyId} radiusKm={radius} />
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