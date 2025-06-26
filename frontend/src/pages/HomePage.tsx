import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, TrendingUp, Home, Building, Briefcase } from 'lucide-react';
import PropertyCard from '../components/properties/PropertyCard';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://mexican-real-estate-ai.onrender.com/api';
console.log('HomePage API_URL:', API_URL);
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);

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

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Fetch featured properties on mount
  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const response = await axios.get(`${API_URL}/properties/featured/listings?limit=8`);
      if (response.data.success) {
        const data = response.data.data || [];
        setFeaturedProperties(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching featured properties:', error);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const quickSearches = [
    { label: 'Casas en CDMX', query: 'Casa en Ciudad de México' },
    { label: 'Departamentos en Polanco', query: 'Departamento en Miguel Hidalgo' },
    { label: 'Propiedades en Cancún', query: 'Cancún' },
    { label: 'Casas en Monterrey', query: 'Casa en Monterrey' },
  ];

  const stats = [
    { label: 'Propiedades Activas', value: '10,539', icon: Home },
    { label: 'Ciudades', value: '150+', icon: MapPin },
    { label: 'Nuevas Este Mes', value: '1,200+', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&h=1080&fit=crop"
            alt="Luxury home"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Encuentra tu hogar ideal en México
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Más de 10,000 propiedades en todo México. Búsqueda inteligente con IA.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ciudad, colonia o tipo de propiedad..."
                className="w-full pl-14 pr-32 py-5 text-lg rounded-full shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 placeholder:text-gray-400 placeholder:opacity-60"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors font-medium"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Quick Searches */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="text-white/80 text-sm">Búsquedas populares:</span>
            {quickSearches.map((search) => (
              <button
                key={search.query}
                onClick={() => {
                  setSearchQuery(search.query);
                  navigate(`/properties?search=${encodeURIComponent(search.query)}`);
                }}
                className="text-sm px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-colors"
              >
                {search.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Propiedades Destacadas</h2>
              <p className="text-gray-600 mt-2">Descubre las mejores oportunidades del mercado</p>
            </div>
            <Link
              to="/properties"
              className="hidden md:inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ver todas las propiedades
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-56 rounded-t-xl"></div>
                  <div className="bg-white p-6 rounded-b-xl border border-gray-200">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.isArray(featuredProperties) && featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link
              to="/properties"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Ver todas las propiedades
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Buscas algo específico?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Usa nuestra búsqueda avanzada con IA para encontrar exactamente lo que necesitas
          </p>
          <Link
            to="/ai-search"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            <Search className="w-5 h-5 mr-2" />
            Búsqueda Inteligente con IA
          </Link>
        </div>
      </section>

      {/* Property Types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Explora por Tipo de Propiedad
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { type: 'Casa', icon: Home, count: '3,245' },
              { type: 'Departamento', icon: Building, count: '2,890' },
              { type: 'Terreno', icon: MapPin, count: '1,567' },
              { type: 'Oficina', icon: Briefcase, count: '890' },
              { type: 'Local', icon: Building, count: '654' },
              { type: 'Bodega', icon: Home, count: '432' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.type}
                  to={`/properties?propertyType=${item.type}`}
                  className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <Icon className="w-12 h-12 text-blue-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900">{item.type}</h3>
                  <p className="text-sm text-gray-500">{item.count} propiedades</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;