import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { checkAuthConfig, enableAuthDebug } from '../utils/debug';
import MuchaCasaLogoSimple from '../components/MuchaCasaLogoSimple';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: { [key: string]: string } = {
    auth_failed: 'Error al iniciar sesión. Por favor intenta de nuevo.',
    missing_tokens: 'No se pudieron obtener los tokens de autenticación.',
    unauthorized: 'Necesitas iniciar sesión para acceder a esta página.',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center">
            <MuchaCasaLogoSimple 
              className="w-12 h-12" 
              variant="minimal"
              showText={true} 
              textClassName="ml-3 text-2xl font-bold text-gray-900"
            />
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Inicia sesión para acceder a tu cuenta
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-700">
                {errorMessages[error] || 'Ha ocurrido un error. Por favor intenta de nuevo.'}
              </p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">o</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Alternative Actions */}
          <div className="space-y-4 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <button
                onClick={login}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Regístrate gratis
              </button>
            </p>
            
            <Link
              to="/"
              className="block text-sm text-gray-600 hover:text-gray-700"
            >
              Continuar como invitado →
            </Link>
          </div>

          {/* Benefits */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Al iniciar sesión podrás:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar tus propiedades favoritas
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Configurar alertas de búsqueda
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Contactar directamente a los agentes
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Ver el historial de tus búsquedas
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Al continuar, aceptas nuestros{' '}
          <Link to="/terms" className="text-blue-600 hover:underline">
            Términos de Servicio
          </Link>{' '}
          y{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline">
            Política de Privacidad
          </Link>
        </p>
        
        {/* Debug info (only in development) */}
        {import.meta.env.DEV && (
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                enableAuthDebug();
                const config = checkAuthConfig();
                console.log('Auth Configuration:', config);
                alert(`Auth URL: ${config.authUrl}`);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Debug Auth Config
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;