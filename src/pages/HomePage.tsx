import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import QuizCard from '../components/QuizCard';
import { Zap, Settings, CircleOff, CheckCheck } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeQuizzes } = useApp();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">

                <img src="/images/logo.png" alt="Groupe Ouellet logo" className='rounded-xl h-[84px] border-2 border-green-100 py-1' />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CatéGO</h1>
                <p className="text-green-600 font-medium">Une application de Groupe Ouellet</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/validation')}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
              >
                <CheckCheck className="w-5 h-5" />
                <span className="font-medium">Validation</span>
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre Quiz
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Entrainer notre IA en associant des éléments à leur catégorie correspondante. 
            Pour commencer, sélectionnez un quiz !
          </p>
        </div>

        {activeQuizzes.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CircleOff className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              Aucun quiz disponible
            </h3>
            <p className="text-gray-500">
              Les quiz seront bientôt disponibles. Revenez plus tard !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onClick={() => navigate(`/quiz/${quiz.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-green-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 Group Ouellet</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;