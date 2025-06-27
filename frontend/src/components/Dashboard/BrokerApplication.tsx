import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, Clock, Upload, AlertCircle } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface ApplicationStatus {
  status: 'none' | 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

const BrokerApplication: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    licenseNumber: '',
    brokerageName: '',
    yearsExperience: '',
    phoneNumber: '',
    specializations: [] as string[],
    aboutMe: '',
    documents: [] as File[]
  });

  // Check application status
  const { data: applicationStatus, isLoading } = useQuery({
    queryKey: ['brokerApplicationStatus'],
    queryFn: async () => {
      const response = await api.get('/user/broker-application/status');
      return response.data.data as ApplicationStatus;
    }
  });

  // Submit application mutation
  const submitApplication = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/user/broker-application', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('¡Solicitud enviada con éxito!');
    },
    onError: () => {
      toast.error('Error al enviar la solicitud. Por favor intenta de nuevo.');
    }
  });

  const specializations = [
    'Residencial',
    'Comercial',
    'Industrial',
    'Terrenos',
    'Desarrollos',
    'Renta Vacacional',
    'Lujo',
    'Primera Vivienda'
  ];

  const handleSpecializationToggle = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        documents: Array.from(e.target.files || [])
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'documents') {
        (value as File[]).forEach(file => {
          data.append('documents', file);
        });
      } else if (key === 'specializations') {
        data.append(key, JSON.stringify(value));
      } else {
        data.append(key, value as string);
      }
    });

    submitApplication.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  // Show status if already applied
  if (applicationStatus?.status && applicationStatus.status !== 'none') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Estado de tu Solicitud para Agente
        </h2>
        
        <div className="space-y-4">
          {applicationStatus.status === 'pending' && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Solicitud en Revisión</h3>
                <p className="text-yellow-700 mt-1">
                  Tu solicitud está siendo revisada por nuestro equipo. 
                  Te notificaremos por correo cuando tengamos una respuesta.
                </p>
                <p className="text-sm text-yellow-600 mt-2">
                  Enviada el: {new Date(applicationStatus.submittedAt!).toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>
          )}

          {applicationStatus.status === 'approved' && (
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">¡Solicitud Aprobada!</h3>
                <p className="text-green-700 mt-1">
                  Felicidades, tu cuenta ha sido actualizada a Agente Inmobiliario. 
                  Ya puedes acceder a todas las herramientas para agentes.
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Aprobada el: {new Date(applicationStatus.reviewedAt!).toLocaleDateString('es-MX')}
                </p>
                <a 
                  href="/dashboard" 
                  className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Ir al Dashboard de Agente
                </a>
              </div>
            </div>
          )}

          {applicationStatus.status === 'rejected' && (
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Solicitud Rechazada</h3>
                <p className="text-red-700 mt-1">
                  Lo sentimos, tu solicitud no pudo ser aprobada en este momento.
                </p>
                {applicationStatus.reviewNote && (
                  <p className="text-red-600 mt-2 text-sm">
                    Motivo: {applicationStatus.reviewNote}
                  </p>
                )}
                <p className="text-sm text-red-600 mt-2">
                  Puedes volver a aplicar en 30 días.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show application form
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Conviértete en Agente Inmobiliario
        </h2>
        <p className="text-gray-600 mt-2">
          Completa el siguiente formulario para solicitar acceso como agente en nuestra plataforma.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* License Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Información de Licencia</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Licencia *
            </label>
            <input
              type="text"
              required
              value={formData.licenseNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: AMPI-12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inmobiliaria (opcional)
            </label>
            <input
              type="text"
              value={formData.brokerageName}
              onChange={(e) => setFormData(prev => ({ ...prev, brokerageName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre de tu inmobiliaria"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Años de Experiencia *
            </label>
            <select
              required
              value={formData.yearsExperience}
              onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona...</option>
              <option value="0-1">Menos de 1 año</option>
              <option value="1-3">1-3 años</option>
              <option value="3-5">3-5 años</option>
              <option value="5-10">5-10 años</option>
              <option value="10+">Más de 10 años</option>
            </select>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono de Contacto *
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        {/* Specializations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Especializaciones</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {specializations.map(spec => (
              <label key={spec} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specializations.includes(spec)}
                  onChange={() => handleSpecializationToggle(spec)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{spec}</span>
              </label>
            ))}
          </div>
        </div>

        {/* About Me */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Acerca de Ti
          </label>
          <textarea
            rows={4}
            value={formData.aboutMe}
            onChange={(e) => setFormData(prev => ({ ...prev, aboutMe: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Cuéntanos sobre tu experiencia en bienes raíces..."
          />
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Documentos *
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Sube una foto de tu licencia y cualquier certificación relevante (PDF, JPG, PNG - Max 5MB cada uno)
          </p>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Subir archivos</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="sr-only"
                    required
                  />
                </label>
              </div>
              {formData.documents.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {formData.documents.length} archivo(s) seleccionado(s)
                  </p>
                  <ul className="mt-2 text-xs text-gray-600">
                    {formData.documents.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Proceso de Verificación
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                Tu solicitud será revisada en un plazo de 2-3 días hábiles. 
                Te notificaremos por correo electrónico cuando tengamos una respuesta.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitApplication.isPending}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitApplication.isPending ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrokerApplication;