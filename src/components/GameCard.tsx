import React from 'react';

interface Card {
  id: number;
  text_description: string;
  quiz_id: number;
}

interface GameCardProps {
  card: Card;
  cardNumber: number;
  totalCards: number;
}

const GameCard: React.FC<GameCardProps> = ({ card, cardNumber, totalCards }) => {
  // Calculate progress percentage
  const progress = Math.round((cardNumber / totalCards) * 100);
  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6 sm:mb-8 transform transition-all duration-300 hover:shadow-2xl">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-green-700">Progression</span>
          <span className="text-xs font-medium text-green-700">{cardNumber} / {totalCards}</span>
        </div>
        <div className="w-full bg-green-100 rounded-full h-2.5 dark:bg-green-200">
          <div
            className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
          {card.text_description}
        </h2>
        <p className="text-gray-600 text-base sm:text-lg">
          Sélectionnez la catégorie appropriée pour cet élément
        </p>
      </div>
    </div>
  );
};

export default GameCard;