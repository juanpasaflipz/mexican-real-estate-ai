import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Bath, Maximize2, MapPin } from 'lucide-react';

interface Property {
  id: number;
  title: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  property_type: string;
  city: string;
  state: string;
  neighborhood: string | null;
  primary_image: string;
}

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const formatPrice = (price: string) => {
    const num = parseInt(price);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Link
      to={`/properties/${property.id}`}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        {property.primary_image ? (
          <img
            src={property.primary_image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Sin imagen</p>
            </div>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="inline-flex px-3 py-1 text-xs font-medium text-white bg-gray-900 bg-opacity-75 backdrop-blur-sm rounded-full">
            {property.property_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Price */}
        <div className="mb-2">
          <p className="text-2xl font-semibold text-gray-900">
            {formatPrice(property.price)}
          </p>
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">
            {property.neighborhood ? `${property.neighborhood}, ` : ''}
            {property.city}, {property.state}
          </span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {property.bedrooms > 0 && (
            <div className="flex items-center">
              <Home className="w-4 h-4 mr-1" />
              <span>{property.bedrooms} rec</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.bathrooms} {property.bathrooms === 1 ? 'baño' : 'baños'}</span>
            </div>
          )}
          {property.area_sqm && (
            <div className="flex items-center">
              <Maximize2 className="w-4 h-4 mr-1" />
              <span>{property.area_sqm} m²</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;