import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  FileText, 
  User, 
  Check,
  X,
  Clock,
  Eye
} from 'lucide-react';

interface BrokerApplication {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  license_number: string;
  brokerage_name: string;
  years_experience: string;
  phone_number: string;
  specializations: string[];
  about_me: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  review_note?: string;
}

const BrokerApplicationReview: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [reviewNote, setReviewNote] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<BrokerApplication | null>(null);

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  // Fetch applications
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['brokerApplications', selectedStatus],
    queryFn: async () => {
      const response = await api.get('/user/admin/broker-applications', {
        params: { status: selectedStatus === 'all' ? undefined : selectedStatus }
      });
      return response.data.data;
    }
  });

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ id, action, note }: { id: number; action: 'approve' | 'reject'; note?: string }) => {
      const response = await api.post(`/user/admin/broker-applications/${id}/review`, {
        action,
        reviewNote: note
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.action === 'approve' 
          ? 'Solicitud aprobada exitosamente' 
          : 'Solicitud rechazada'
      );
      setSelectedApplication(null);
      setReviewNote('');
      refetch();
    },
    onError: () => {
      toast.error('Error al procesar la solicitud');
    }
  });

  const handleReview = (application: BrokerApplication, action: 'approve' | 'reject') => {
    if (action === 'reject' && !reviewNote) {
      toast.error('Por favor proporciona una razón para el rechazo');
      return;
    }

    reviewMutation.mutate({ 
      id: application.id, 
      action,
      note: action === 'reject' ? reviewNote : undefined
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Pendiente
        </span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1">
          <Check className="w-3 h-3" /> Aprobada
        </span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1">
          <X className="w-3 h-3" /> Rechazada
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Solicitudes de Agentes
        </h1>
        <p className="text-gray-600">
          Revisa y aprueba las solicitudes de los usuarios que quieren convertirse en agentes
        </p>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'Todas' :
             status === 'pending' ? 'Pendientes' :
             status === 'approved' ? 'Aprobadas' : 'Rechazadas'}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.applications?.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No hay solicitudes {selectedStatus !== 'all' ? selectedStatus === 'pending' ? 'pendientes' : selectedStatus === 'approved' ? 'aprobadas' : 'rechazadas' : ''}</p>
            </div>
          ) : (
            data?.applications?.map((application: BrokerApplication) => (
              <div key={application.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {application.user_name}
                    </h3>
                    <p className="text-sm text-gray-600">{application.user_email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(application.status)}
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Licencia</p>
                    <p className="font-medium">{application.license_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Experiencia</p>
                    <p className="font-medium">{application.years_experience}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Teléfono</p>
                    <p className="font-medium">{application.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Enviada</p>
                    <p className="font-medium">
                      {new Date(application.submitted_at).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>

                {application.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleReview(application, 'approve')}
                      disabled={reviewMutation.isPending}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApplication(application);
                        setReviewNote('');
                      }}
                      disabled={reviewMutation.isPending}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold">Detalles de la Solicitud</h2>
                <button
                  onClick={() => {
                    setSelectedApplication(null);
                    setReviewNote('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Información del Usuario</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nombre</p>
                    <p className="font-medium">{selectedApplication.user_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedApplication.user_email}</p>
                  </div>
                </div>
              </div>

              {/* License Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Información de Licencia
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Número de Licencia</p>
                    <p className="font-medium">{selectedApplication.license_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Inmobiliaria</p>
                    <p className="font-medium">{selectedApplication.brokerage_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Años de Experiencia</p>
                    <p className="font-medium">{selectedApplication.years_experience}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Teléfono</p>
                    <p className="font-medium">{selectedApplication.phone_number}</p>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              {selectedApplication.specializations?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Especializaciones</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.specializations.map((spec, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* About */}
              {selectedApplication.about_me && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Acerca del Solicitante</h3>
                  <p className="text-gray-700 text-sm">{selectedApplication.about_me}</p>
                </div>
              )}

              {/* Documents */}
              {selectedApplication.documents?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Documentos</h3>
                  <div className="space-y-2">
                    {selectedApplication.documents.map((doc, index) => (
                      <a
                        key={index}
                        href={`/api/${doc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        Documento {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Actions */}
              {selectedApplication.status === 'pending' && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Acciones de Revisión</h3>
                  
                  {selectedApplication.status === 'pending' && reviewNote !== undefined && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nota de Rechazo (requerida para rechazar)
                      </label>
                      <textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Explica por qué se rechaza la solicitud..."
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(selectedApplication, 'approve')}
                      disabled={reviewMutation.isPending}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Aprobar Solicitud
                    </button>
                    <button
                      onClick={() => handleReview(selectedApplication, 'reject')}
                      disabled={reviewMutation.isPending || !reviewNote}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Rechazar Solicitud
                    </button>
                  </div>
                </div>
              )}

              {/* Status Info */}
              {selectedApplication.status !== 'pending' && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Estado de la Revisión</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500">Estado</p>
                      <p>{getStatusBadge(selectedApplication.status)}</p>
                    </div>
                    {selectedApplication.reviewed_at && (
                      <div>
                        <p className="text-gray-500">Fecha de Revisión</p>
                        <p className="font-medium">
                          {new Date(selectedApplication.reviewed_at).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    )}
                    {selectedApplication.review_note && (
                      <div>
                        <p className="text-gray-500">Nota de Revisión</p>
                        <p className="font-medium">{selectedApplication.review_note}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerApplicationReview;