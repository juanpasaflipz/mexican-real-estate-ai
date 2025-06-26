import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, Building, Briefcase } from 'lucide-react';
import { LatestListings } from '../components/LatestListings/LatestListings';
import { MarketStats } from '../components/MarketStats/MarketStats';

const API_URL = import.meta.env.VITE_API_URL || 'https://mexican-real-estate-ai.onrender.com/api';
console.log('HomePage API_URL:', API_URL);
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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

      {/* Dynamic Market Stats */}
      <MarketStats />

      {/* Latest Listings Section - New Dynamic Component */}
      <LatestListings />


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