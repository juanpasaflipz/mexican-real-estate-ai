import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Share2, 
  Heart, 
  Printer,
  Home,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  Car,
  Building
} from 'lucide-react';
import PropertyGallery from '../components/PropertyGallery';
import PropertyCard from '../components/PropertyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import propertyService from '../services/propertyService';
import { PropertyDetailResponse, SimilarProperty } from '../services/propertyService';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyDetailResponse | null>(null);
  const [similarProperties, setSimilarProperties] = useState<SimilarProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch property details and similar properties in parallel
      const [propertyData, similarData] = await Promise.all([
        propertyService.getPropertyById(id!),
        propertyService.getSimilarProperties(id!)
      ]);

      setProperty(propertyData);
      setSimilarProperties(similarData);
    } catch (err) {
      console.error('Error fetching property details:', err);
      setError('No se pudo cargar la información de la propiedad');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && property) {
      navigator.share({
        title: property.title,
        text: `${property.title} - ${propertyService.formatPrice(property.price)}`,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality with backend
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {error || 'Propiedad no encontrada'}
          </h2>
          <button
            onClick={() => navigate('/properties')}
            className="text-blue-600 hover:text-blue-700"
          >
            Ver todas las propiedades
          </button>
        </div>
      </div>
    );
  }

  const images = propertyService.processImages(property);
  const area = property.area_sqm || property.size_m2 || 0;
  const pricePerSqm = propertyService.calculatePricePerSqm(property.price, area);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Photo Gallery */}
      <PropertyGallery images={images} title={property.title} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{property.address}, {property.city}, {property.state}</span>
                  </div>
                  {property.neighborhood && (
                    <p className="text-gray-600 mt-1">
                      Colonia {property.neighborhood}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-full border ${
                      isFavorite 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                    aria-label="Guardar en favoritos"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                    aria-label="Compartir"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 print:hidden"
                    aria-label="Imprimir"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Price and Property Type */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {propertyService.formatPrice(property.price)}
                </span>
                {property.property_type && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {propertyService.getPropertyTypeLabel(property.property_type)}
                  </span>
                )}
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Bed className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recámaras</p>
                  <p className="font-semibold text-gray-900">{property.bedrooms || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Bath className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Baños</p>
                  <p className="font-semibold text-gray-900">{property.bathrooms || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Square className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Área</p>
                  <p className="font-semibold text-gray-900">
                    {property.area_sqm || property.size_m2 || 'N/A'} m²
                  </p>
                </div>
              </div>
              {property.parking_spaces !== undefined && property.parking_spaces >= 0 ? (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Car className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estacionamiento</p>
                    <p className="font-semibold text-gray-900">{property.parking_spaces}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Home className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Precio/m²</p>
                    <p className="font-semibold text-gray-900">{pricePerSqm}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Descripción
              </h2>
              {property.description ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800">
                    No hay descripción detallada disponible para esta propiedad. 
                    <button 
                      onClick={() => setShowContactForm(true)}
                      className="text-amber-900 font-medium underline hover:text-amber-700"
                    >
                      Contacta al agente
                    </button> para obtener más información.
                  </p>
                </div>
              )}
            </div>

            {/* Amenities */}
            {(() => {
              const amenities = propertyService.processAmenities(property);
              return amenities.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Características y Amenidades
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Additional Property Details */}
            {(property.year_built || property.lot_size_m2 || 
              (property.parking_spaces !== undefined && property.parking_spaces >= 0) ||
              property.property_type) && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Detalles de la Propiedad
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.property_type && (
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-gray-600" />
                        <div>
                          <span className="text-sm text-gray-500">Tipo de Propiedad:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {propertyService.getPropertyTypeLabel(property.property_type)}
                          </span>
                        </div>
                      </div>
                    )}
                    {property.year_built && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div>
                          <span className="text-sm text-gray-500">Año de Construcción:</span>
                          <span className="ml-2 font-medium text-gray-900">{property.year_built}</span>
                        </div>
                      </div>
                    )}
                    {property.lot_size_m2 && (
                      <div className="flex items-center gap-3">
                        <Square className="w-5 h-5 text-gray-600" />
                        <div>
                          <span className="text-sm text-gray-500">Tamaño del Terreno:</span>
                          <span className="ml-2 font-medium text-gray-900">{property.lot_size_m2} m²</span>
                        </div>
                      </div>
                    )}
                    {property.parking_spaces !== undefined && property.parking_spaces >= 0 && (
                      <div className="flex items-center gap-3">
                        <Car className="w-5 h-5 text-gray-600" />
                        <div>
                          <span className="text-sm text-gray-500">Lugares de Estacionamiento:</span>
                          <span className="ml-2 font-medium text-gray-900">{property.parking_spaces}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {area > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Precio por Metro Cuadrado:</span>
                        <span className="font-semibold text-gray-900">{pricePerSqm}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Neighborhood Section */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ubicación y Vecindario
              </h2>
              <div className="bg-gray-100 rounded-lg p-6">
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>Dirección:</strong> {property.address}
                  </p>
                  <p className="text-gray-700">
                    <strong>Ciudad:</strong> {property.city}
                  </p>
                  <p className="text-gray-700">
                    <strong>Estado:</strong> {property.state}
                  </p>
                  {property.neighborhood && (
                    <p className="text-gray-700">
                      <strong>Colonia:</strong> {property.neighborhood}
                    </p>
                  )}
                </div>
                
                {property.latitude && property.longitude ? (
                  <div className="mt-6">
                    <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                      <p className="text-gray-600">
                        Mapa disponible cuando se active la facturación de Google Maps
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Las coordenadas exactas no están disponibles para esta propiedad.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Propiedades Similares
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {similarProperties.slice(0, 4).map((similarProperty) => (
                    <PropertyCard
                      key={similarProperty.id}
                      property={{
                        id: similarProperty.id,
                        title: similarProperty.title,
                        price: similarProperty.price,
                        bedrooms: similarProperty.bedrooms,
                        bathrooms: similarProperty.bathrooms,
                        size_m2: similarProperty.area_sqm,
                        property_type: similarProperty.property_type,
                        city: similarProperty.city,
                        state: similarProperty.state,
                        main_image: similarProperty.primary_image,
                        address: '',
                        description: '',
                        latitude: 0,
                        longitude: 0
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Contactar al Agente
                </h3>
                
                {!showContactForm ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      Enviar Mensaje
                    </button>
                    <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
                      <Phone className="w-5 h-5" />
                      Llamar Ahora
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Agendar Visita
                    </button>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        defaultValue={`Estoy interesado en la propiedad: ${property.title}`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Enviar Mensaje
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="w-full text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Cancelar
                    </button>
                  </form>
                )}
              </div>

              {/* Property Stats */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Estadísticas
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    Vistas: <span className="font-medium text-gray-900">{property.view_count || 0}</span>
                  </p>
                  <p className="text-gray-600">
                    Publicado: <span className="font-medium text-gray-900">
                      {new Date(property.created_at).toLocaleDateString('es-MX')}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    ID de Propiedad: <span className="font-medium text-gray-900">#{property.id}</span>
                  </p>
                  {property.detail_scraped && (
                    <p className="text-green-600 text-xs mt-2">
                      ✓ Información completa disponible
                    </p>
                  )}
                  {!property.detail_scraped && (
                    <p className="text-amber-600 text-xs mt-2">
                      ⚠ Información básica disponible
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;