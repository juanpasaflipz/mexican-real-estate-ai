import React, { useState, useEffect } from 'react';
import { TrendingUp, Home, MapPin, Calendar } from 'lucide-react';

interface MarketStatsData {
  total_properties: string;
  total_cities: string;
  avg_price: string;
  new_this_week: string;
}

export function MarketStats() {
  const [stats, setStats] = useState<MarketStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketStats();
  }, []);

  const fetchMarketStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/landing/market-stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching market stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: string) => {
    return parseInt(num).toLocaleString('es-MX');
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    return `$${formatNumber(price)}`;
  };

  if (loading) {
    return (
      <div className="bg-blue-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-blue-500 rounded mb-2"></div>
                <div className="h-4 bg-blue-500 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-blue-600 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center text-white">
            <div className="flex justify-center mb-2">
              <Home className="w-8 h-8" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatNumber(stats.total_properties)}
            </div>
            <div className="text-blue-200 text-sm">
              Propiedades Activas
            </div>
          </div>

          <div className="text-center text-white">
            <div className="flex justify-center mb-2">
              <MapPin className="w-8 h-8" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatNumber(stats.total_cities)}
            </div>
            <div className="text-blue-200 text-sm">
              Ciudades
            </div>
          </div>

          <div className="text-center text-white">
            <div className="flex justify-center mb-2">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatPrice(stats.avg_price)}
            </div>
            <div className="text-blue-200 text-sm">
              Precio Promedio
            </div>
          </div>

          <div className="text-center text-white">
            <div className="flex justify-center mb-2">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatNumber(stats.new_this_week)}
            </div>
            <div className="text-blue-200 text-sm">
              Nuevas Esta Semana
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}