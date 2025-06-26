import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  TrendingUp,
  Settings
} from 'lucide-react';

// Import role-specific widgets
import {
  SavedSearchesWidget,
  FavoritePropertiesWidget,
  RecentlyViewedWidget,
  MarketTrendsWidget
} from './widgets/UserWidgets';

import {
  MyListingsWidget,
  LeadsWidget,
  CommissionWidget,
  AppointmentsWidget,
  PerformanceWidget
} from './widgets/BrokerWidgets';

import {
  PlatformStatsWidget,
  UserManagementWidget,
  ModerationQueueWidget,
  SystemHealthWidget,
  RevenueWidget
} from './widgets/AdminWidgets';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Redirect to login if not authenticated
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Render dashboard based on user role
  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'broker':
        return <BrokerDashboard />;
      case 'subscriber':
      case 'user':
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {getGreeting()}, {user?.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {user?.role === 'admin' && 'Panel de Administración'}
                  {user?.role === 'broker' && 'Panel de Agente'}
                  {(user?.role === 'user' || user?.role === 'subscriber') && 'Mi Dashboard'}
                </p>
              </div>
            </div>
            
            {/* Quick actions based on role */}
            <div className="flex items-center space-x-4">
              {user?.role === 'broker' && (
                <a
                  href="/properties/new"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Nueva Propiedad
                </a>
              )}
              
              {user?.role === 'admin' && (
                <a
                  href="/admin/settings"
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Configuración
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {renderDashboard()}
      </main>
    </div>
  );
};

// User Dashboard Component
const UserDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <SavedSearchesWidget />
      <FavoritePropertiesWidget />
      <RecentlyViewedWidget />
      <MarketTrendsWidget />
    </div>
  );
};

// Broker Dashboard Component
const BrokerDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Key metrics row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <MyListingsWidget />
        <LeadsWidget />
        <CommissionWidget />
        <AppointmentsWidget />
      </div>
      
      {/* Performance section */}
      <PerformanceWidget />
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Platform overview */}
      <PlatformStatsWidget />
      
      {/* Management sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <UserManagementWidget />
        <ModerationQueueWidget />
        <SystemHealthWidget />
      </div>
      
      {/* Revenue section */}
      <RevenueWidget />
    </div>
  );
};

export default Dashboard;