import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, MapPin, Bed, Bath, Maximize } from 'lucide-react';

interface Property {
  id: number;
  title: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  property_type: string;
  city: string;
  state: string;
  neighborhood?: string;
  primary_image?: string;
  listing_type: 'sale' | 'rent';
}

interface LatestListingsData {
  forSale: Property[];
  forRent: Property[];
}

export function LatestListings() {
  const [listings, setListings] = useState<LatestListingsData>({ forSale: [], forRent: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sale' | 'rent'>('sale');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchLatestListings();
    // Refresh every 12 hours
    const interval = setInterval(fetchLatestListings, 12 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchLatestListings = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/landing/by-listing-type`);
      const data = await response.json();
      
      if (data.success) {
        setListings(data.data);
        setLastUpdated(new Date().toLocaleString('es-MX'));
      }
    } catch (error) {
      console.error('Error fetching latest listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (numPrice >= 1000000) {
      return `$${(numPrice / 1000000).toFixed(1)}M MXN`;
    }
    return `$${numPrice.toLocaleString('es-MX')} MXN`;
  };

  const getImageUrl = (image: string | undefined) => {
    if (!image || image.includes('data:image')) {
      return 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop';
    }
    return image;
  };

  const displayProperties = activeTab === 'sale' ? listings.forSale : listings.forRent;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Propiedades Destacadas
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Las mejores oportunidades en Ciudad de México y principales ciudades
          </p>
          
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
              <button
                onClick={() => setActiveTab('sale')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'sale'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                En Venta
              </button>
              <button
                onClick={() => setActiveTab('rent')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'rent'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                En Renta
              </button>
            </div>
          </div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProperties.map((property) => (
              <Link
                key={property.id}
                to={`/properties/${property.id}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getImageUrl(property.primary_image)}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm font-semibold">
                    {property.property_type}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white font-bold text-lg">
                      {formatPrice(property.price)}
                    </p>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {property.title || `${property.property_type} en ${property.city}`}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="line-clamp-1">
                      {property.neighborhood ? `${property.neighborhood}, ` : ''}
                      {property.city}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-gray-600 text-sm">
                    <div className="flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      <span>{property.bedrooms || '-'}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      <span>{property.bathrooms || '-'}</span>
                    </div>
                    <div className="flex items-center">
                      <Maximize className="w-4 h-4 mr-1" />
                      <span>{property.area_sqm ? `${property.area_sqm}m²` : '-'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View More Link */}
        <div className="text-center mt-8">
          <Link
            to="/properties"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver todas las propiedades
            <Home className="ml-2 w-5 h-5" />
          </Link>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Última actualización: {lastUpdated}
          </p>
        )}
      </div>
    </section>
  );
}