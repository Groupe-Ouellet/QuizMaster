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

const GameCard: React.FC<GameCardProps> = ({ card }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6 sm:mb-8 transform transition-all duration-300 hover:shadow-2xl">
      {/* Removed progress bar and card counter as requested */}
      
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