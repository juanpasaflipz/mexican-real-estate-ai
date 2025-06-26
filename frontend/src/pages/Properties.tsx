import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronDown, Loader2 } from 'lucide-react';
import PropertyCard from '../components/properties/PropertyCard';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://mexican-real-estate-ai.onrender.com/api';

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

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

const Properties: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasMore: false,
  });
  
  // AI Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isSearching, setIsSearching] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    propertyType: searchParams.get('propertyType') || '',
  });

  const [showFilters, setShowFilters] = useState(false);

  // Cities for dropdown - includes main cities and CDMX alcaldías
  const cities = [
    { value: 'Ciudad de México', label: 'Ciudad de México (Todas las alcaldías)' },
    { value: '', label: '─────────────', disabled: true },
    { value: 'Cuauhtémoc', label: 'Cuauhtémoc (CDMX)' },
    { value: 'Miguel Hidalgo', label: 'Miguel Hidalgo (CDMX)' },
    { value: 'Benito Juárez', label: 'Benito Juárez (CDMX)' },
    { value: 'Coyoacán', label: 'Coyoacán (CDMX)' },
    { value: 'Tlalpan', label: 'Tlalpan (CDMX)' },
    { value: '', label: '─────────────', disabled: true },
    { value: 'Guadalajara', label: 'Guadalajara' },
    { value: 'Monterrey', label: 'Monterrey' },
    { value: 'Puebla', label: 'Puebla' },
    { value: 'Tijuana', label: 'Tijuana' },
    { value: 'León', label: 'León' },
    { value: 'Zapopan', label: 'Zapopan' },
    { value: 'Mérida', label: 'Mérida' },
    { value: 'San Luis Potosí', label: 'San Luis Potosí' },
    { value: 'Querétaro', label: 'Querétaro' },
    { value: 'Cancún', label: 'Cancún' },
    { value: 'Playa del Carmen', label: 'Playa del Carmen' },
    { value: 'Puerto Vallarta', label: 'Puerto Vallarta' },
    { value: 'Tulum', label: 'Tulum' }
  ];

  const propertyTypes = [
    { value: 'Casa', label: 'Casa' },
    { value: 'Departamento', label: 'Departamento' },
    { value: 'Terreno', label: 'Terreno' },
    { value: 'Oficina', label: 'Oficina' },
    { value: 'Local', label: 'Local Comercial' },
    { value: 'Bodega', label: 'Bodega' },
  ];

  const fetchProperties = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '24');
      
      // Add filters from URL params
      const city = searchParams.get('city');
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      const bedrooms = searchParams.get('bedrooms');
      const propertyType = searchParams.get('propertyType');

      if (city) params.append('city', city);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (bedrooms) params.append('bedrooms', bedrooms);
      if (propertyType) params.append('propertyType', propertyType);

      const response = await axios.get(`${API_URL}/properties?${params}`);
      
      if (response.data.success) {
        const propertiesData = response.data.data?.properties || [];
        // Ensure we have an array
        setProperties(Array.isArray(propertiesData) ? propertiesData : []);
        setPagination(response.data.data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasMore: false
        });
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // AI-powered search
  const handleAISearch = useCallback(async (query?: string) => {
    const searchText = query || searchQuery;
    if (!searchText.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.post(`${API_URL}/properties/search`, {
        query: searchText
      });

      if (response.data.success && response.data.data) {
        const results = response.data.data || [];
        setProperties(Array.isArray(results) ? results : []);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: Array.isArray(results) ? results.length : 0,
          hasMore: false
        });
      }
    } catch (error) {
      console.error('Error in AI search:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Update URL when filters change
  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      propertyType: '',
    });
    setSearchParams(new URLSearchParams());
  };

  useEffect(() => {
    fetchProperties(1);
  }, [fetchProperties]);

  // Sync filters with URL params
  useEffect(() => {
    setFilters({
      city: searchParams.get('city') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      propertyType: searchParams.get('propertyType') || '',
    });
    
    // Execute AI search if search parameter is present
    const search = searchParams.get('search');
    if (search && search !== searchQuery) {
      setSearchQuery(search);
      handleAISearch(search);
    }
  }, [searchParams, searchQuery, handleAISearch]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-6">
            Encuentra tu propiedad ideal
          </h1>
          
          {/* AI Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                placeholder="Buscar propiedades..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 placeholder:opacity-70"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                onClick={() => handleAISearch()}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Buscar'
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Usa búsqueda inteligente o aplica filtros tradicionales
            </p>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {Object.values(filters).some(f => f) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas las ciudades</option>
                    {cities.map((city, index) => (
                      <option 
                        key={city.value || `separator-${index}`} 
                        value={city.value}
                        disabled={city.disabled}
                      >
                        {city.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de propiedad
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los tipos</option>
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recámaras mínimas
                  </label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Cualquiera</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio mínimo
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio máximo
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    placeholder="Sin límite"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Apply Button */}
                <div className="flex items-end">
                  <button
                    onClick={applyFilters}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results count */}
        <div className="mb-6 text-sm text-gray-600">
          {pagination.totalCount > 0 && (
            <span>{pagination.totalCount.toLocaleString()} propiedades encontradas</span>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron propiedades con los filtros seleccionados</p>
          </div>
        ) : (
          <>
            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.isArray(properties) && properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => fetchProperties(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Página {pagination.currentPage} de {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => fetchProperties(pagination.currentPage + 1)}
                    disabled={!pagination.hasMore}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Properties;