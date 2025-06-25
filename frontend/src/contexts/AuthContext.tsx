import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'broker' | 'subscriber' | 'user';
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Configure api defaults
  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Fetch current user
  const fetchUser = async () => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');

      if (response.data.success) {
        setUser(response.data.data);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // If token is invalid, clear it
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  // Refresh access token
  const refreshToken = async () => {
    try {
      const refresh = Cookies.get('refresh_token');
      if (!refresh) throw new Error('No refresh token');

      const response = await api.post('/auth/refresh', {
        refreshToken: refresh
      });

      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        Cookies.set('access_token', accessToken, { expires: 7 });
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        setUser(user);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };

  // Login (redirect to Google OAuth)
  const login = () => {
    window.location.href = '/api/auth/google';
  };

  // Logout
  const logout = async () => {
    try {
      const refresh = Cookies.get('refresh_token');
      
      // Call logout endpoint
      await api.post('/auth/logout', {
        refreshToken: refresh
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state
      setUser(null);
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/';
    }
  };

  // Check if user has required role
  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  };

  // Initialize auth on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!user) return;

    // Refresh token every 6 hours
    const interval = setInterval(() => {
      refreshToken();
    }, 6 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};