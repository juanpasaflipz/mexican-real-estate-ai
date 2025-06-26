import React from 'react';
import MuchaCasaLogoSimple from '../components/MuchaCasaLogoSimple';
import MuchaCasaLogoModern from '../components/MuchaCasaLogoModern';

const LogoDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-12">Mucha Casa Logo Options</h1>
      

      {/* Simple Versions */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Simple Versions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <MuchaCasaLogoSimple className="w-24 h-24 mx-auto mb-4" variant="default" />
            <MuchaCasaLogoSimple className="w-12 h-12 mx-auto mb-4" variant="default" showText={true} />
            <p className="text-center text-sm text-gray-600">Simple Filled</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <MuchaCasaLogoSimple className="w-24 h-24 mx-auto mb-4" variant="outline" />
            <MuchaCasaLogoSimple className="w-12 h-12 mx-auto mb-4" variant="outline" showText={true} />
            <p className="text-center text-sm text-gray-600">Outline Only</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <MuchaCasaLogoSimple className="w-24 h-24 mx-auto mb-4" variant="minimal" />
            <MuchaCasaLogoSimple className="w-12 h-12 mx-auto mb-4" variant="minimal" showText={true} />
            <p className="text-center text-sm text-gray-600">Minimal with MC</p>
          </div>
        </div>
      </div>

      {/* Modern Versions */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Modern Versions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <MuchaCasaLogoModern className="w-24 h-24 mx-auto mb-4" variant="gradient" />
            <MuchaCasaLogoModern className="w-12 h-12 mx-auto mb-4" variant="gradient" showText={true} />
            <p className="text-center text-sm text-gray-600">Gradient</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <MuchaCasaLogoModern className="w-24 h-24 mx-auto mb-4" variant="flat" />
            <MuchaCasaLogoModern className="w-12 h-12 mx-auto mb-4" variant="flat" showText={true} />
            <p className="text-center text-sm text-gray-600">Geometric</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <MuchaCasaLogoModern className="w-24 h-24 mx-auto mb-4" variant="letter" />
            <MuchaCasaLogoModern className="w-12 h-12 mx-auto mb-4" variant="letter" showText={true} />
            <p className="text-center text-sm text-gray-600">Letter M House</p>
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
              <MuchaCasaLogoSimple className="w-8 h-8" variant="outline" showText={true} />
              <nav className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-600 hover:text-gray-900">Propiedades</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Mapa</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Blog</a>
              </nav>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <MuchaCasaLogoModern className="w-8 h-8" variant="gradient" showText={true} />
              <nav className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-600 hover:text-gray-900">Propiedades</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Mapa</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Blog</a>
              </nav>
            </div>
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <MuchaCasaLogoSimple className="w-8 h-8 text-white" variant="minimal" showText={true} textClassName="ml-2 text-xl font-semibold text-white" />
              <nav className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-300 hover:text-white">Propiedades</a>
                <a href="#" className="text-gray-300 hover:text-white">Mapa</a>
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