import React, { useState, useCallback, memo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Property } from '../types/property';
import { formatPrice } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface PropertyMapProps {
  properties: Property[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPropertySelect?: (property: Property) => void;
  className?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 19.4326, // Mexico City
  lng: -99.1332
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: true,
  rotateControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

const PropertyMap: React.FC<PropertyMapProps> = memo(({
  properties,
  center = defaultCenter,
  zoom = 11,
  onPropertySelect,
  className = ''
}) => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property);
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  };

  const handleInfoWindowClose = () => {
    setSelectedProperty(null);
  };

  const handlePropertyClick = (propertyId: number) => {
    navigate(`/property/${propertyId}`);
  };

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <p className="text-red-600">Error al cargar el mapa</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="animate-pulse">
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  // Filter properties with valid coordinates
  const validProperties = Array.isArray(properties) 
    ? properties.filter(
        p => p && p.latitude && p.longitude && 
        !isNaN(p.latitude) && !isNaN(p.longitude)
      )
    : [];

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={options}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {validProperties.length > 0 && validProperties.map((property) => property && (
          <Marker
            key={property.id}
            position={{
              lat: property.latitude!,
              lng: property.longitude!
            }}
            onClick={() => handleMarkerClick(property)}
            icon={{
              path: 'M 0,0 -1,-2 -3,-2 -3,-8 3,-8 3,-2 1,-2 z',
              fillColor: '#1a73e8',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
              scale: 1.5,
              labelOrigin: new google.maps.Point(0, -4)
            }}
            label={{
              text: formatPrice(property.price),
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              className: 'map-price-label'
            }}
          />
        ))}

        {selectedProperty && (
          <InfoWindow
            position={{
              lat: selectedProperty.latitude!,
              lng: selectedProperty.longitude!
            }}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="p-2 max-w-xs">
              <img
                src={selectedProperty.main_image || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'}
                alt={selectedProperty.title}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <h3 className="font-semibold text-lg mb-1">
                {formatPrice(selectedProperty.price)}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                {selectedProperty.property_type}
              </p>
              <p className="text-sm mb-1">
                {selectedProperty.bedrooms} rec · {selectedProperty.bathrooms} baños · {selectedProperty.size_m2} m²
              </p>
              <p className="text-sm text-gray-600 mb-2">
                {selectedProperty.city}, {selectedProperty.state}
              </p>
              <button
                onClick={() => handlePropertyClick(selectedProperty.id)}
                className="w-full bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Ver detalles
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
});

PropertyMap.displayName = 'PropertyMap';

export default PropertyMap;