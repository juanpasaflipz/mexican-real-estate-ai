import React from 'react';
import { Home, Users, TrendingUp, Calendar, DollarSign, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

// My listings performance
export const MyListingsWidget: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['brokerListings'],
    queryFn: async () => {
      const response = await api.get('/broker/listings');
      return response.data.data;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-600" />
          Mis Propiedades
        </h3>
        <a href="/broker/listings" className="text-sm text-blue-600 hover:underline">
          Ver todas
        </a>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{data?.active || 0}</p>
          <p className="text-xs text-gray-500">Activas</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">{data?.pending || 0}</p>
          <p className="text-xs text-gray-500">Pendientes</p>
        </div>
      </div>

      {!isLoading && data?.topPerformers && (
        <div className="space-y-2 border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Mejor Desempeño</p>
          {data.topPerformers.map((property: any) => (
            <div key={property.id} className="flex justify-between items-center text-sm">
              <span className="truncate flex-1">{property.title}</span>
              <span className="text-gray-500 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {property.views}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Leads management widget
export const LeadsWidget: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['brokerLeads'],
    queryFn: async () => {
      const response = await api.get('/broker/leads');
      return response.data.data;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          Leads Recientes
        </h3>
        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
          {data?.new || 0} nuevos
        </span>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.leads?.slice(0, 5).map((lead: any) => (
            <div key={lead.id} className="border-l-2 border-green-500 pl-3 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{lead.name}</p>
                  <p className="text-xs text-gray-500">{lead.property}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">📧 {lead.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Commission tracker
export const CommissionWidget: React.FC = () => {
  const { data } = useQuery({
    queryKey: ['brokerCommissions'],
    queryFn: async () => {
      const response = await api.get('/broker/commissions');
      return response.data.data;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Comisiones
        </h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Este Mes</p>
          <p className="text-2xl font-bold text-gray-900">
            ${data?.thisMonth?.toLocaleString() || 0} MXN
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-gray-500">Pendientes</p>
            <p className="text-lg font-semibold text-orange-600">
              ${data?.pending?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Año Total</p>
            <p className="text-lg font-semibold text-green-600">
              ${data?.yearTotal?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Appointments calendar widget
export const AppointmentsWidget: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['brokerAppointments'],
    queryFn: async () => {
      const response = await api.get('/broker/appointments/upcoming');
      return response.data.data;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Próximas Citas
        </h3>
        <a href="/broker/calendar" className="text-sm text-blue-600 hover:underline">
          Ver calendario
        </a>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.appointments?.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay citas programadas
            </p>
          ) : (
            data?.appointments?.map((apt: any) => (
              <div key={apt.id} className="flex gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">{apt.monthShort}</p>
                    <p className="text-lg font-bold">{apt.day}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{apt.clientName}</p>
                  <p className="text-xs text-gray-600">{apt.property}</p>
                  <p className="text-xs text-blue-600">{apt.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Performance metrics
export const PerformanceWidget: React.FC = () => {
  const { data } = useQuery({
    queryKey: ['brokerPerformance'],
    queryFn: async () => {
      const response = await api.get('/broker/performance');
      return response.data.data;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6 col-span-2">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        Mi Desempeño
      </h3>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{data?.viewsTotal || 0}</p>
          <p className="text-xs text-gray-500">Vistas Totales</p>
          <p className="text-xs text-green-600 mt-1">
            {data?.viewsTrend > 0 ? '+' : ''}{data?.viewsTrend || 0}% vs mes anterior
          </p>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{data?.inquiries || 0}</p>
          <p className="text-xs text-gray-500">Consultas</p>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{data?.showings || 0}</p>
          <p className="text-xs text-gray-500">Visitas</p>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{data?.closedDeals || 0}</p>
          <p className="text-xs text-gray-500">Cerrados</p>
        </div>
      </div>
    </div>
  );
};