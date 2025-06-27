import React from 'react';
import { Users, Home, Activity, AlertCircle, TrendingUp, Database } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

// Platform statistics
export const PlatformStatsWidget: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data.data;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6 col-span-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Estadísticas de la Plataforma
      </h3>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{data?.totalUsers || 0}</p>
          <p className="text-xs text-gray-600">Usuarios Totales</p>
          <p className="text-xs text-green-600">+{data?.newUsersThisMonth || 0} este mes</p>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Home className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{data?.totalProperties || 0}</p>
          <p className="text-xs text-gray-600">Propiedades</p>
          <p className="text-xs text-blue-600">{data?.activeProperties || 0} activas</p>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{data?.dailyActiveUsers || 0}</p>
          <p className="text-xs text-gray-600">Usuarios Activos Hoy</p>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{data?.searchesToday || 0}</p>
          <p className="text-xs text-gray-600">Búsquedas Hoy</p>
        </div>
      </div>
    </div>
  );
};

// User management widget
export const UserManagementWidget: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['recentUsers'],
    queryFn: async () => {
      const response = await api.get('/admin/users/recent');
      return response.data.data;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Usuarios Recientes
        </h3>
        <a href="/admin/users" className="text-sm text-blue-600 hover:underline">
          Gestionar usuarios
        </a>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.users?.map((user: any) => (
            <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <img 
                  src={user.avatarUrl || '/default-avatar.png'} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                user.role === 'broker' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Property moderation queue
export const ModerationQueueWidget: React.FC = () => {
  const { data: moderationData, isLoading: modLoading } = useQuery({
    queryKey: ['moderationQueue'],
    queryFn: async () => {
      const response = await api.get('/admin/moderation/queue');
      return response.data.data;
    }
  });

  const { data: brokerApps, isLoading: brokerLoading } = useQuery({
    queryKey: ['pendingBrokerApplications'],
    queryFn: async () => {
      const response = await api.get('/user/admin/broker-applications', {
        params: { status: 'pending' }
      });
      return response.data.data;
    }
  });

  const totalPending = (moderationData?.pending || 0) + (brokerApps?.pagination?.total || 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          Cola de Moderación
        </h3>
        <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
          {totalPending} pendientes
        </span>
      </div>
      
      {modLoading || brokerLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Broker Applications */}
          {brokerApps?.applications?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Solicitudes de Agentes</h4>
              {brokerApps.applications.slice(0, 2).map((app: any) => (
                <div key={app.id} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{app.user_name}</p>
                      <p className="text-xs text-gray-600">Licencia: {app.license_number}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              <a 
                href="/admin/broker-applications" 
                className="text-xs text-blue-600 hover:underline block text-center"
              >
                Ver todas las solicitudes →
              </a>
            </div>
          )}

          {/* Property Moderation */}
          {moderationData?.items?.length > 0 && (
            <>
              <h4 className="text-sm font-medium text-gray-700 mt-4">Propiedades</h4>
              {moderationData.items.map((item: any) => (
                <div key={item.id} className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-600">Por: {item.brokerName}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                      Aprobar
                    </button>
                    <button className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {totalPending === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay elementos pendientes
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// System health widget
export const SystemHealthWidget: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const response = await api.get('/admin/system/health');
      return response.data.data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-gray-600" />
        Estado del Sistema
      </h3>
      
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">API Server</span>
            <span className={`text-sm font-medium ${getStatusColor(data?.api?.status)}`}>
              {data?.api?.status === 'healthy' ? '✓ Operativo' : '⚠ Problema'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Base de Datos</span>
            <span className={`text-sm font-medium ${getStatusColor(data?.database?.status)}`}>
              {data?.database?.status === 'healthy' ? '✓ Operativo' : '⚠ Problema'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pinecone Vector DB</span>
            <span className={`text-sm font-medium ${getStatusColor(data?.pinecone?.status)}`}>
              {data?.pinecone?.status === 'healthy' ? '✓ Operativo' : '⚠ Problema'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Cache</span>
            <span className={`text-sm font-medium ${getStatusColor(data?.cache?.status)}`}>
              {data?.cache?.status === 'healthy' ? '✓ Operativo' : '⚠ Problema'}
            </span>
          </div>
          
          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Última actualización</span>
              <span>{new Date(data?.lastChecked).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Revenue metrics widget
export const RevenueWidget: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['revenueMetrics'],
    queryFn: async () => {
      const response = await api.get('/admin/revenue');
      return response.data.data;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6 col-span-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Métricas de Ingresos
      </h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Este Mes</p>
          <p className="text-2xl font-bold text-gray-900">
            ${data?.thisMonth?.toLocaleString() || 0} MXN
          </p>
          <p className={`text-sm ${data?.monthGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data?.monthGrowth > 0 ? '+' : ''}{data?.monthGrowth || 0}% vs mes anterior
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Suscripciones Activas</p>
          <p className="text-2xl font-bold text-gray-900">{data?.activeSubscriptions || 0}</p>
          <p className="text-sm text-gray-600">
            {data?.newSubscriptions || 0} nuevas este mes
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Tasa de Conversión</p>
          <p className="text-2xl font-bold text-gray-900">{data?.conversionRate || 0}%</p>
          <p className="text-sm text-gray-600">
            De visitante a suscriptor
          </p>
        </div>
      </div>
    </div>
  );
};