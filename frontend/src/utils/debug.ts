// Debug utility for tracking authentication flow
export const debugAuth = {
  log: (message: string, data?: any) => {
    if (import.meta.env.DEV || localStorage.getItem('debug_auth') === 'true') {
      console.log(`[AUTH DEBUG] ${message}`, data || '');
    }
  },
  
  error: (message: string, error?: any) => {
    console.error(`[AUTH ERROR] ${message}`, error || '');
  }
};

// Enable debug mode
export const enableAuthDebug = () => {
  localStorage.setItem('debug_auth', 'true');
  console.log('[AUTH DEBUG] Debug mode enabled');
};

// Disable debug mode
export const disableAuthDebug = () => {
  localStorage.removeItem('debug_auth');
  console.log('[AUTH DEBUG] Debug mode disabled');
};

// Check current environment and URLs
export const checkAuthConfig = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const isDev = import.meta.env.DEV;
  const mode = import.meta.env.MODE;
  
  console.log('[AUTH CONFIG CHECK]', {
    apiUrl,
    isDev,
    mode,
    currentUrl: window.location.href,
    origin: window.location.origin
  });
  
  return {
    apiUrl,
    isDev,
    mode,
    authUrl: `${apiUrl.replace('/api', '')}/api/auth/google`
  };
};