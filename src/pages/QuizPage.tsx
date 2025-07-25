import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import UserNameModal from '../components/UserNameModal';
import GameCard from '../components/GameCard';
import CategoryButton from '../components/CategoryButton';
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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  // A simple state to control the visibility/animation of the card
  const [isCardVisible, setIsCardVisible] = useState(true);

  useEffect(() => {
    if (id) {
      loadQuiz(parseInt(id));
    }
    // On mount, ensure the card is visible.
    setIsCardVisible(true);
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

  const handleCategorySelect = (categoryId: number) => {
    if (!isCardVisible || !currentCards[currentCardIndex]) return;

    // 1. Immediately provide visual feedback and start the "out" animation
    setSelectedCategory(categoryId);
    setIsCardVisible(false); // This triggers the fade-out animation

    // 2. Fire the API call in the background (Optimistic UI)
    // We don't `await` it, so the UI isn't blocked by the network
    submitAnswer(currentCards[currentCardIndex].id, categoryId);

    // 3. After the "out" animation finishes, update the card data.
    // The duration (300ms) MUST match the CSS transition duration.
    setTimeout(() => {
      nextCard();
      // 4. Reset state for the next card and trigger the "in" animation
      setSelectedCategory(null);
      setIsCardVisible(true); // This triggers the fade-in animation
    }, 300); 
  };

  const handleRestart = () => {
    resetQuiz();
    setShowUserModal(true);
  };

  const isQuizComplete = currentCardIndex >= currentCards.length;
  const currentCard = currentCards[currentCardIndex];

  // Return a consistent header/skeleton while loading to prevent layout shifts
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header (No changes here, it's already good) */}
      <header className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-200 rounded-lg p-2 -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Retour</span>
            </button>
            <div className="text-center flex-1 mx-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{currentQuiz?.name || 'Chargement...'}</h1>
              {userName && <p className="text-green-600 font-medium text-sm sm:text-base">Joueur : {userName}</p>}
            </div>
            <button
              onClick={handleRestart}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-200 rounded-lg p-2 -mr-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Recommencer</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
        {!currentQuiz ? (
          <div className="flex items-center justify-center pt-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Chargement du quiz...</p>
            </div>
          </div>
        ) : !isQuizComplete && currentCard ? (
          // We use the card's ID as a key on the inner content
          // to ensure React correctly re-renders when the card changes.
          <div>
            <div
              className={`transition-all duration-300 ease-in-out ${
                isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
            >
              <GameCard
                key={currentCard.id}
                card={currentCard}
                cardNumber={currentCardIndex + 1}
                totalCards={currentCards.length}
              />
            </div>
            <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currentCategories.map((category) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  onClick={() => handleCategorySelect(category.id)}
                  isSelected={selectedCategory === category.id}
                />
              ))}
            </div>
          </div>
        ) : (
          // Completion screen (no animation changes needed here, it's already good)
          <div className="text-center py-12 sm:py-16 px-2 sm:px-0 animate-fade-in-up">
            <div className="p-4 sm:p-6 bg-green-100 rounded-full w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 flex items-center justify-center transform transition-transform duration-500 hover:scale-110">
              <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-green-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Félicitations, {userName}!
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-lg mx-auto">
              Vous avez terminé le quiz "{currentQuiz.name}". Toutes vos réponses ont été enregistrées.
            </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={handleRestart} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 text-lg shadow-md hover:shadow-lg">
                <RotateCcw className="w-5 h-5 mr-2" /> Rejouer ce quiz
              </button>
               <button onClick={() => navigate('/')} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-white text-green-600 border-2 border-green-200 rounded-xl font-semibold hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-lg">
                <ArrowLeft className="w-5 h-5 mr-2" /> Autres quiz
              </button>
            </div>
          </div>
        )}
      </main>

      <UserNameModal
        isOpen={showUserModal}
        onSubmit={handleUserNameSubmit}
        onClose={() => navigate('/')} // Redirect home if they close the modal without a name
      />
    </div>
  );
};

export default QuizPage;