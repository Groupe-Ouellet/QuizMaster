import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import QuizCard from '../components/QuizCard';
import { Zap, Settings, CircleOff, CheckCheck, Menu, X } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeQuizzes } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false); // Close menu on navigation
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <img 
                src="/images/logo.png" 
                alt="Groupe Ouellet logo" 
                className='rounded-xl h-12 sm:h-[84px] border-2 border-green-100 py-1' 
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CatéGO</h1>
                <p className="text-green-600 font-medium hidden sm:block">Une application de Groupe Ouellet</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => handleNavigation('/validation')}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
              >
                <CheckCheck className="w-5 h-5" />
                <span className="font-medium">Validation</span>
              </button>
              <button
                onClick={() => handleNavigation('/admin')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Admin</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => handleNavigation('/validation')}
                className="w-full flex items-center space-x-3 px-3 py-2 text-base font-medium text-blue-700 hover:bg-blue-50 rounded-md"
              >
                <CheckCheck className="w-5 h-5" />
                <span>Validation</span>
              </button>
              <button
                onClick={() => handleNavigation('/admin')}
                className="w-full flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <Settings className="w-5 h-5" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content (No changes below this line) */}
      <main className="flex-grow max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Choisissez votre Quiz
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Entrainer notre IA en associant des éléments à leur catégorie correspondante. 
            Pour commencer, sélectionnez un quiz !
          </p>
        </div>

        {activeQuizzes.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="p-4 sm:p-6 bg-gray-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <CircleOff className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-1 sm:mb-2">
              Aucun quiz disponible
            </h3>
            <p className="text-gray-500">
              Les quiz seront bientôt disponibles. Revenez plus tard !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
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
            <p>© 2025 Group Ouellet</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;