import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize2, MapPin, Heart } from 'lucide-react';
import { Property } from '../types/property';
import { formatPrice } from '../utils/formatters';

interface PropertyCardProps {
  property: Property;
  onFavorite?: (propertyId: number) => void;
  isFavorite?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onFavorite, isFavorite = false }) => {
  const image = property.main_image || property.primary_image || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop';
  const area = property.size_m2 || property.area_sqm || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative">
        <Link to={`/properties/${property.id}`}>
          <img
            src={image}
            alt={property.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop';
            }}
          />
        </Link>
        {onFavorite && (
          <button
            onClick={() => onFavorite(property.id)}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {formatPrice(property.price)}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2">
          {property.property_type}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-700 mb-3">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms} rec</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms} baños</span>
          </div>
          {area > 0 && (
            <div className="flex items-center gap-1">
              <Maximize2 className="w-4 h-4" />
              <span>{area} m²</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="truncate">
            {property.neighborhood && `${property.neighborhood}, `}
            {property.city}, {property.state}
          </span>
        </div>
        
        <Link
          to={`/properties/${property.id}`}
          className="mt-3 block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver detalles
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;