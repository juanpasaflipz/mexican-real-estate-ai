import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refresh');
      const error = searchParams.get('error');

      if (error) {
        console.error('Auth error:', error);
        navigate('/login?error=' + error);
        return;
      }

      if (token && refreshToken) {
        // Store tokens in cookies
        Cookies.set('access_token', token, { expires: 7 });
        Cookies.set('refresh_token', refreshToken, { expires: 30 });

        // Redirect to intended page or home
        const intendedUrl = sessionStorage.getItem('auth_redirect') || '/';
        sessionStorage.removeItem('auth_redirect');
        
        // Force a page reload to update auth context
        window.location.href = intendedUrl;
      } else {
        navigate('/login?error=missing_tokens');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Iniciando sesión...</h2>
        <p className="text-gray-600 mt-2">Por favor espera mientras completamos el proceso.</p>
      </div>
    </div>
  );
};

export default AuthCallback;