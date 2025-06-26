import React from 'react';
import { Heart, Search, Eye, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

// Widget for saved searches
export const SavedSearchesWidget: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['savedSearches'],
    queryFn: async () => {
      const response = await api.get('/user/saved-searches');
      return response.data.data;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          Búsquedas Guardadas
        </h3>
        <span className="text-sm text-gray-500">{data?.length || 0} activas</span>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.slice(0, 5).map((search: any) => (
            <div key={search.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium">{search.query}</p>
                <p className="text-xs text-gray-500">{search.resultCount} resultados</p>
              </div>
              <Bell className={`w-4 h-4 ${search.alertEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Widget for favorite properties
export const FavoritePropertiesWidget: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['favoriteProperties'],
    queryFn: async () => {
      const response = await api.get('/user/favorites');
      return response.data.data;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Propiedades Favoritas
        </h3>
        <span className="text-sm text-gray-500">{data?.length || 0} guardadas</span>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.slice(0, 3).map((property: any) => (
            <div key={property.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded">
              <img 
                src={property.imageUrl || '/placeholder-property.jpg'} 
                alt={property.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-1">{property.title}</p>
                <p className="text-xs text-gray-500">{property.location}</p>
                <p className="text-sm font-semibold text-blue-600">${property.price.toLocaleString()} MXN</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Widget for recently viewed properties
export const RecentlyViewedWidget: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['recentlyViewed'],
    queryFn: async () => {
      const response = await api.get('/user/recently-viewed');
      return response.data.data;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Eye className="w-5 h-5 text-gray-600" />
          Vistos Recientemente
        </h3>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.slice(0, 5).map((view: any) => (
            <a 
              key={view.id} 
              href={`/properties/${view.propertyId}`}
              className="block p-2 hover:bg-gray-50 rounded"
            >
              <p className="text-sm font-medium line-clamp-1">{view.title}</p>
              <p className="text-xs text-gray-500">
                {view.city} • Visto {new Date(view.viewedAt).toLocaleDateString()}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

// Market trends widget for users
export const MarketTrendsWidget: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['marketTrends'],
    queryFn: async () => {
      const response = await api.get('/analytics/market-trends');
      return response.data.data;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6 col-span-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Tendencias del Mercado en tus Zonas de Interés
      </h3>
      
      {isLoading ? (
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      ) : (
        <div className="space-y-4">
          {data?.areas?.map((area: any) => (
            <div key={area.name} className="border-l-4 border-blue-600 pl-4">
              <h4 className="font-medium">{area.name}</h4>
              <div className="flex gap-6 text-sm text-gray-600 mt-1">
                <span>Precio promedio: ${area.avgPrice.toLocaleString()}</span>
                <span className={`font-medium ${area.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {area.trend > 0 ? '+' : ''}{area.trend}% este mes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};