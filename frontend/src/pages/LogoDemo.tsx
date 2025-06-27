import React from 'react';
import HausBrokerLogo from '../components/HausBrokerLogo';
import HausBrokerIcon from '../components/HausBrokerIcon';

const LogoDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-12">Haus Broker Logo Options</h1>
      

      {/* Logo Variations */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Logo Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <HausBrokerIcon className="w-24 h-24 mx-auto mb-4" />
            <HausBrokerLogo className="h-12 mx-auto mb-4" />
            <p className="text-center text-sm text-gray-600">Default Logo</p>
          </div>
          
          <div className="bg-gray-900 p-8 rounded-lg shadow-sm">
            <HausBrokerIcon className="w-24 h-24 mx-auto mb-4 text-white" />
            <HausBrokerLogo className="h-12 mx-auto mb-4" isDark />
            <p className="text-center text-sm text-gray-400">Dark Mode</p>
          </div>
          
          <div className="bg-blue-600 p-8 rounded-lg shadow-sm">
            <HausBrokerIcon className="w-24 h-24 mx-auto mb-4 text-white" />
            <div className="flex justify-center">
              <HausBrokerIcon className="w-8 h-8 text-white" />
              <span className="ml-2 text-xl font-semibold text-white">Haus Broker</span>
            </div>
            <p className="text-center text-sm text-white mt-4">Brand Colors</p>
          </div>
        </div>
      </div>

      {/* Size Variations */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Size Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <HausBrokerIcon className="w-8 h-8 mx-auto mb-4" />
            <p className="text-center text-sm text-gray-600">Small (32px)</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <HausBrokerIcon className="w-12 h-12 mx-auto mb-4" />
            <p className="text-center text-sm text-gray-600">Medium (48px)</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <HausBrokerIcon className="w-16 h-16 mx-auto mb-4" />
            <p className="text-center text-sm text-gray-600">Large (64px)</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <HausBrokerIcon className="w-24 h-24 mx-auto mb-4" />
            <p className="text-center text-sm text-gray-600">XLarge (96px)</p>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div>
        <h2 className="text-xl font-semibold mb-6">In Context</h2>
        <div className="space-y-4">
          {/* Navigation Bar Examples */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <HausBrokerLogo className="h-8" />
              <nav className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-600 hover:text-gray-900">Properties</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Map</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Blog</a>
              </nav>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <HausBrokerIcon className="w-8 h-8 text-blue-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">Haus Broker</span>
              </div>
              <nav className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-600 hover:text-gray-900">Properties</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Map</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Blog</a>
              </nav>
            </div>
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <HausBrokerLogo className="h-8" isDark />
              <nav className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-300 hover:text-white">Properties</a>
                <a href="#" className="text-gray-300 hover:text-white">Map</a>
                <a href="#" className="text-gray-300 hover:text-white">Blog</a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoDemo;