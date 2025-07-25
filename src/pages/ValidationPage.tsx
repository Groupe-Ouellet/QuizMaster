import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import PasswordModal from '../components/PasswordModal';
import { ArrowLeft, Shield, Check, X, Clock } from 'lucide-react';

const ValidationPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    authType,
    pendingSubmissions,
    authenticate,
    logout,
    loadPendingSubmissions,
    updateSubmissionStatus
  } = useApp();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [hoveredSubmission, setHoveredSubmission] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || authType !== 'validation') {
      setShowPasswordModal(true);
    } else {
      loadPendingSubmissions();
    }
  }, [isAuthenticated, authType, loadPendingSubmissions]);

  const handleAuthenticate = async (password: string) => {
    const success = await authenticate(password, 'validation');
    if (success) {
      setShowPasswordModal(false);
      loadPendingSubmissions();
    }
    return success;
  };

  const handleApprove = async (submissionId: number) => {
    await updateSubmissionStatus(submissionId, 'approved');
  };

  const handleReject = async (submissionId: number) => {
    await updateSubmissionStatus(submissionId, 'rejected');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || authType !== 'validation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <PasswordModal
          isOpen={showPasswordModal}
          title="Accès Validation"
          onSubmit={handleAuthenticate}
          onClose={() => navigate('/')}
        />
      </div>
    );
  }

  const totalPendingSubmissions = Object.values(pendingSubmissions).reduce(
    (total, submissions) => total + submissions.length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Validation des Soumissions</h1>
                  <p className="text-blue-600 font-medium">
                    {totalPendingSubmissions} soumission{totalPendingSubmissions !== 1 ? 's' : ''} en attente
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {totalPendingSubmissions === 0 ? (
          <div className="text-center py-16">
            <div className="p-6 bg-green-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              Aucune soumission en attente
            </h3>
            <p className="text-gray-500">
              Toutes les soumissions ont été traitées. Excellent travail !
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(pendingSubmissions).map(([categoryName, submissions]) => (
              <div key={categoryName} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Catégorie : {categoryName}</span>
                    <span className="bg-blue-400 text-blue-100 px-2 py-1 rounded-full text-sm">
                      {submissions.length}
                    </span>
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilisateur</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((submission) => (
                          <tr
                            key={submission.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                            onMouseEnter={() => setHoveredSubmission(submission.id)}
                            onMouseLeave={() => setHoveredSubmission(null)}
                          >
                            <td className="py-4 px-4 font-medium text-gray-900">
                              {submission.card_description}
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {submission.user_name}
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {new Date(submission.timestamp).toLocaleString('fr-FR')}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex justify-center space-x-2">
                                {hoveredSubmission === submission.id && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(submission.id)}
                                      className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 transform hover:scale-105"
                                    >
                                      <Check className="w-4 h-4" />
                                      <span>Approuver</span>
                                    </button>
                                    <button
                                      onClick={() => handleReject(submission.id)}
                                      className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 transform hover:scale-105"
                                    >
                                      <X className="w-4 h-4" />
                                      <span>Rejeter</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ValidationPage;