import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import PropertyMap from '../components/PropertyMap';
import PropertyCard from '../components/PropertyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Property } from '../types/property';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Filters {
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
}

const MapSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 19.4326, lng: -99.1332 });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  const [filters, setFilters] = useState<Filters>({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    propertyType: searchParams.get('propertyType') || ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, filters, searchQuery]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/properties`);
      const data = response.data.data || response.data || [];
      // Ensure we have an array
      const propertiesData = Array.isArray(data) ? data : [];
      setProperties(propertiesData);
    } catch (err) {
      setError('Error al cargar las propiedades');
      console.error(err);
      setProperties([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Ensure properties is an array before spreading
    if (!Array.isArray(properties)) {
      console.error('Properties is not an array:', properties);
      setFilteredProperties([]);
      return;
    }
    let filtered = [...properties];

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(p => {
        if (!p) return false;
        const query = searchQuery.toLowerCase();
        return (
          (p.title && p.title.toLowerCase().includes(query)) ||
          (p.city && p.city.toLowerCase().includes(query)) ||
          (p.state && p.state.toLowerCase().includes(query)) ||
          (p.address && p.address.toLowerCase().includes(query))
        );
      });
    }

    // Price filters
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseInt(filters.maxPrice));
    }

    // Bedrooms
    if (filters.bedrooms) {
      filtered = filtered.filter(p => p.bedrooms >= parseInt(filters.bedrooms));
    }

    // Bathrooms
    if (filters.bathrooms) {
      filtered = filtered.filter(p => p.bathrooms >= parseInt(filters.bathrooms));
    }

    // Property type
    if (filters.propertyType) {
      filtered = filtered.filter(p => p.property_type === filters.propertyType);
    }

    setFilteredProperties(filtered);

    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      propertyType: ''
    });
    setSearchQuery('');
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    if (property.latitude && property.longitude) {
      setMapCenter({ lat: property.latitude, lng: property.longitude });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>;

  return (
    <div className="h-screen flex flex-col">
      {/* Search Bar */}
      <div className="bg-white shadow-sm p-4 z-10">
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ciudad o dirección..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 placeholder:opacity-70"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filtros
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Buscar
          </button>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="max-w-4xl mx-auto mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Tipo de propiedad</option>
                <option value="Casa">Casa</option>
                <option value="Departamento">Departamento</option>
                <option value="Terreno">Terreno</option>
                <option value="Local">Local Comercial</option>
                <option value="Oficina">Oficina</option>
              </select>

              <input
                type="number"
                placeholder="Precio mínimo"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />

              <input
                type="number"
                placeholder="Precio máximo"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />

              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Recámaras</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>

              <select
                value={filters.bathrooms}
                onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Baños</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </div>
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        <div className="max-w-4xl mx-auto mt-2 text-sm text-gray-600">
          {filteredProperties.length} propiedades encontradas
        </div>
      </div>

      {/* Map and Results */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <PropertyMap
            properties={filteredProperties}
            center={mapCenter}
            onPropertySelect={handlePropertySelect}
            className="h-full"
          />
        </div>

        {/* Property List */}
        <div className="w-96 bg-white overflow-y-auto">
          <div className="p-4 space-y-4">
            {Array.isArray(filteredProperties) && filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className={`cursor-pointer transition-all ${
                    selectedProperty?.id === property.id
                      ? 'ring-2 ring-blue-500 rounded-lg'
                      : ''
                  }`}
                  onClick={() => handlePropertySelect(property)}
                >
                  <PropertyCard property={property} />
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No se encontraron propiedades
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSearch;