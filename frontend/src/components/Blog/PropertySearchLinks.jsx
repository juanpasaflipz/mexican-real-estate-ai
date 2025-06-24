import React from 'react'
import { Link } from 'react-router-dom'

const PropertySearchLinks = ({ post }) => {
  // Extract city names from the post title or tags
  const cityMappings = {
    'CDMX': 'Ciudad de México',
    'Ciudad de México': 'Ciudad de México',
    'Guadalajara': 'Guadalajara',
    'Monterrey': 'Monterrey',
    'Playa del Carmen': 'Playa del Carmen',
    'Tulum': 'Tulum',
    'Cancún': 'Cancún',
    'San Miguel de Allende': 'San Miguel de Allende',
    'Querétaro': 'Querétaro',
    'Mérida': 'Mérida',
    'Puerto Vallarta': 'Puerto Vallarta',
    'Mazatlán': 'Mazatlán',
    'Cabo': 'Cabo San Lucas',
    'Los Cabos': 'Cabo San Lucas',
    'Puebla': 'Puebla',
    'Tijuana': 'Tijuana',
    'Mexicali': 'Mexicali',
    'Ensenada': 'Ensenada',
    'Oaxaca': 'Oaxaca',
    'Polanco': 'Polanco, Ciudad de México',
    'Roma Norte': 'Roma Norte, Ciudad de México',
    'Condesa': 'Condesa, Ciudad de México'
  }

  // Find cities mentioned in the post
  const mentionedCities = []
  const searchableText = `${post.title_es} ${post.tags?.join(' ') || ''}`
  
  Object.entries(cityMappings).forEach(([key, value]) => {
    if (searchableText.includes(key)) {
      mentionedCities.push({ key, value })
    }
  })

  if (mentionedCities.length === 0) return null

  // Create search queries for the AI chat
  const searchQueries = mentionedCities.map(city => ({
    query: `Mostrar propiedades en ${city.value}`,
    link: `/?q=${encodeURIComponent(`Mostrar propiedades en ${city.value}`)}`
  }))

  return (
    <div className="bg-blue-50 rounded-lg p-6 my-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🏠 Buscar Propiedades Mencionadas
      </h3>
      <p className="text-gray-700 mb-4">
        Explora propiedades disponibles en las ubicaciones mencionadas en este artículo:
      </p>
      <div className="space-y-2">
        {searchQueries.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            className="block bg-white rounded-md px-4 py-3 hover:bg-blue-100 transition border border-blue-200"
          >
            <span className="text-blue-600 font-medium">→ {item.query}</span>
          </Link>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-blue-200">
        <p className="text-sm text-gray-600">
          💡 Tip: Usa nuestro chat con IA para búsquedas más específicas como:
        </p>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          <li>• "Casas de 3 recámaras en {mentionedCities[0]?.value}"</li>
          <li>• "Departamentos con vista al mar bajo 5 millones"</li>
          <li>• "Propiedades para inversión con alto ROI"</li>
        </ul>
      </div>
    </div>
  )
}

export default PropertySearchLinks