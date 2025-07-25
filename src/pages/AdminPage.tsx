import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import PasswordModal from '../components/PasswordModal';
import { 
  ArrowLeft, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Download,
  Filter
} from 'lucide-react';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, authType, allQuizzes, loadAllQuizzes, authenticate, logout } = useApp();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'content' | 'export'>('quizzes');
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [quizzes, setQuizzes] = useState(allQuizzes);

  // Form states
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [quizForm, setQuizForm] = useState({ name: '', description: '', isActive: true });

  // Content management states
  const [cards, setCards] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [cardForm, setCardForm] = useState({ text_description: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '' });

  // Export states
  const [exportFilters, setExportFilters] = useState({
    quiz_id: 'all',
    status: 'all'
  });

  const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

  useEffect(() => {
    if (!isAuthenticated || authType !== 'admin') {
      setShowPasswordModal(true);
    } else {
      loadAllQuizzes();
    }
  }, [isAuthenticated, authType, loadAllQuizzes]);

  useEffect(() => {
    setQuizzes(allQuizzes);
  }, [allQuizzes]);

  useEffect(() => {
    if (selectedQuizId) {
      loadQuizContent(selectedQuizId);
    }
  }, [selectedQuizId]);

  const handleAuthenticate = async (password: string) => {
    const success = await authenticate(password, 'admin');
    if (success) {
      setShowPasswordModal(false);
      loadAllQuizzes();
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Quiz management functions
  const loadQuizContent = async (quizId: number) => {
    try {
      const [cardsRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE}/cards/quiz/${quizId}`),
        fetch(`${API_BASE}/categories/quiz/${quizId}`)
      ]);

      const cardsData = await cardsRes.json();
      const categoriesData = await categoriesRes.json();

      setCards(cardsData.cards || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Error loading quiz content:', error);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizForm)
      });

      if (response.ok) {
        setShowQuizForm(false);
        setQuizForm({ name: '', description: '', isActive: true });
        loadAllQuizzes();
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuiz) return;

    try {
      const response = await fetch(`${API_BASE}/quiz/${editingQuiz.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizForm)
      });

      if (response.ok) {
        setEditingQuiz(null);
        setQuizForm({ name: '', description: '', isActive: true });
        loadAllQuizzes();
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
    }
  };

  const handleToggleQuiz = async (quizId: number) => {
    try {
      const response = await fetch(`${API_BASE}/quiz/${quizId}/toggle`, {
        method: 'PATCH'
      });

      if (response.ok) {
        loadAllQuizzes();
      }
    } catch (error) {
      console.error('Error toggling quiz:', error);
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) return;

    try {
      const response = await fetch(`${API_BASE}/quiz/${quizId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadAllQuizzes();
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  // Card management functions
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) return;

    try {
      const response = await fetch(`${API_BASE}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cardForm, quiz_id: selectedQuizId })
      });

      if (response.ok) {
        setShowCardForm(false);
        setCardForm({ text_description: '' });
        loadQuizContent(selectedQuizId);
      }
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) return;

    try {
      const response = await fetch(`${API_BASE}/cards/${cardId}`, {
        method: 'DELETE'
      });

      if (response.ok && selectedQuizId) {
        loadQuizContent(selectedQuizId);
      }
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  // Category management functions
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) return;

    try {
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...categoryForm, quiz_id: selectedQuizId })
      });

      if (response.ok) {
        setShowCategoryForm(false);
        setCategoryForm({ name: '' });
        loadQuizContent(selectedQuizId);
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok && selectedQuizId) {
        loadQuizContent(selectedQuizId);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Export functions
  const handleExport = async (format: string) => {
    try {
      const response = await fetch(`${API_BASE}/export/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, ...exportFilters })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz_export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (!isAuthenticated || authType !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <PasswordModal
          isOpen={showPasswordModal}
          title="Accès Administration"
          onSubmit={handleAuthenticate}
          onClose={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
                  <p className="text-gray-600 font-medium">Gestion complète du système</p>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'quizzes', label: 'Gestion des Quiz' },
              { key: 'content', label: 'Gestion du Contenu' },
              { key: 'export', label: 'Export des Données' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quiz Management Tab */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Quiz</h2>
              <button
                onClick={() => setShowQuizForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>Nouveau Quiz</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Nom</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Description</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Statut</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.map((quiz) => (
                      <tr key={quiz.id} className="border-b border-gray-100">
                        <td className="py-4 px-6 font-medium text-gray-900">{quiz.name}</td>
                        <td className="py-4 px-6 text-gray-600">{quiz.description}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            quiz.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {quiz.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingQuiz(quiz);
                                setQuizForm({
                                  name: quiz.name,
                                  description: quiz.description,
                                  isActive: quiz.isActive
                                });
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleQuiz(quiz.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            >
                              {quiz.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quiz Form Modal */}
            {(showQuizForm || editingQuiz) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {editingQuiz ? 'Modifier le Quiz' : 'Nouveau Quiz'}
                    </h3>
                    <form onSubmit={editingQuiz ? handleUpdateQuiz : handleCreateQuiz}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom du quiz
                          </label>
                          <input
                            type="text"
                            value={quizForm.name}
                            onChange={(e) => setQuizForm({ ...quizForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={quizForm.description}
                            onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            rows={3}
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={quizForm.isActive}
                            onChange={(e) => setQuizForm({ ...quizForm, isActive: e.target.checked })}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                            Quiz actif
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setShowQuizForm(false);
                            setEditingQuiz(null);
                            setQuizForm({ name: '', description: '', isActive: true });
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors duration-200"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                        >
                          {editingQuiz ? 'Modifier' : 'Créer'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Management Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Gestion du Contenu</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner un quiz
                </label>
                <select
                  value={selectedQuizId || ''}
                  onChange={(e) => setSelectedQuizId(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Choisir un quiz...</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedQuizId && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cards Management */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Cartes</h3>
                    <button
                      onClick={() => setShowCardForm(true)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {cards.map((card) => (
                      <div key={card.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{card.text_description}</span>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Card Form Modal */}
                  {showCardForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Nouvelle Carte</h3>
                          <form onSubmit={handleCreateCard}>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                              </label>
                              <input
                                type="text"
                                value={cardForm.text_description}
                                onChange={(e) => setCardForm({ text_description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCardForm(false);
                                  setCardForm({ text_description: '' });
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors duration-200"
                              >
                                Annuler
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                              >
                                Ajouter
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Categories Management */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Catégories</h3>
                    <button
                      onClick={() => setShowCategoryForm(true)}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{category.name}</span>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Category Form Modal */}
                  {showCategoryForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Nouvelle Catégorie</h3>
                          <form onSubmit={handleCreateCategory}>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom de la catégorie
                              </label>
                              <input
                                type="text"
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm({ name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCategoryForm(false);
                                  setCategoryForm({ name: '' });
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors duration-200"
                              >
                                Annuler
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                              >
                                Ajouter
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Export Management Tab */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Export des Données</h2>
              <div className="flex items-center space-x-2 text-gray-600">
                <Filter className="w-5 h-5" />
                <span>Filtres et Options d'Export</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Quiz Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Filtre par Quiz
                  </label>
                  <select
                    value={exportFilters.quiz_id}
                    onChange={(e) => setExportFilters({ ...exportFilters, quiz_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">Tous les quiz</option>
                    {quizzes.map((quiz) => (
                      <option key={quiz.id} value={quiz.id}>
                        {quiz.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Filtre par Statut
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="approved"
                        checked={exportFilters.status === 'approved'}
                        onChange={(e) => setExportFilters({ ...exportFilters, status: e.target.value })}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Approuvées seulement</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="all"
                        checked={exportFilters.status === 'all'}
                        onChange={(e) => setExportFilters({ ...exportFilters, status: e.target.value })}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Toutes les soumissions</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Formats d'Export Disponibles
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { format: 'json', label: 'JSON', color: 'blue' },
                    { format: 'csv', label: 'CSV', color: 'green' },
                    { format: 'xlsx', label: 'XLSX', color: 'purple' },
                    { format: 'sqlite', label: 'SQLite', color: 'gray' }
                  ].map((item) => (
                    <button
                      key={item.format}
                      onClick={() => handleExport(item.format)}
                      className={`flex items-center justify-center space-x-2 px-6 py-4 bg-${item.color}-500 text-white rounded-xl hover:bg-${item.color}-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-${item.color}-500 focus:ring-offset-2`}
                    >
                      <Download className="w-5 h-5" />
                      <span className="font-semibold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Info */}
              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-2">Informations sur les Formats :</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>JSON :</strong> Format structuré avec toutes les données détaillées</li>
                  <li><strong>CSV :</strong> Format tableur simple pour analyse</li>
                  <li><strong>XLSX :</strong> Format Excel avec colonnes Description et Catégorie</li>
                  <li><strong>SQLite :</strong> Téléchargement complet de la base de données</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;