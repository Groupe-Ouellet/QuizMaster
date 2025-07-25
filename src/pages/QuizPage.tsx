import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import UserNameModal from '../components/UserNameModal';
import GameCard from '../components/GameCard';
import CategoryButton from '../components/CategoryButton';
import SuccessAnimation from '../components/SuccessAnimation';
import { ArrowLeft, Trophy, RotateCcw } from 'lucide-react';

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentQuiz,
    currentCards,
    currentCategories,
    currentCardIndex,
    userName,
    loadQuiz,
    setUserName,
    submitAnswer,
    nextCard,
    resetQuiz,
  } = useApp();

  const [showUserModal, setShowUserModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadQuiz(parseInt(id));
    }
  }, [id, loadQuiz]);

  useEffect(() => {
    if (currentQuiz && !userName) {
      setShowUserModal(true);
    }
  }, [currentQuiz, userName]);

  const handleUserNameSubmit = (name: string) => {
    setUserName(name);
    setShowUserModal(false);
  };

  const handleCategorySelect = async (categoryId: number) => {
    if (currentCards[currentCardIndex]) {
      setSelectedCategory(categoryId);
      
      // Submit answer
      await submitAnswer(currentCards[currentCardIndex].id, categoryId);
      
      // Show success animation
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedCategory(null);
        nextCard();
      }, 1500);
    }
  };

  const handleRestart = () => {
    resetQuiz();
    setShowUserModal(true);
  };

  const isQuizComplete = currentCardIndex >= currentCards.length;
  const currentCard = currentCards[currentCardIndex];

  if (!currentQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">{currentQuiz.name}</h1>
              {userName && (
                <p className="text-green-600 font-medium">Joueur : {userName}</p>
              )}
            </div>
            
            <button
              onClick={handleRestart}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="font-medium">Recommencer</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isQuizComplete && currentCard ? (
          <>
            <GameCard
              card={currentCard}
              cardNumber={currentCardIndex + 1}
              totalCards={currentCards.length}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentCategories.map((category) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  onClick={() => handleCategorySelect(category.id)}
                  isSelected={selectedCategory === category.id}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="p-6 bg-green-100 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Trophy className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Félicitations !
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Vous avez terminé le quiz "{currentQuiz.name}".
              <br />
              Toutes vos réponses ont été enregistrées.
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors duration-200 transform hover:scale-105"
              >
                Recommencer
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200 transform hover:scale-105"
              >
                Choisir un autre quiz
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals and Animations */}
      <UserNameModal
        isOpen={showUserModal}
        onSubmit={handleUserNameSubmit}
        onClose={() => setShowUserModal(false)}
      />
      
      <SuccessAnimation isVisible={showSuccess} />
    </div>
  );
};

export default QuizPage;