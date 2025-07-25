import React from 'react';
import { Hash } from 'lucide-react';

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
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2 text-gray-500">
          <Hash className="w-5 h-5" />
          <span className="text-sm font-medium">
            Carte {cardNumber} sur {totalCards}
          </span>
        </div>
        
        <div className="flex space-x-1">
          {Array.from({ length: totalCards }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index < cardNumber ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          {card.text_description}
        </h2>
        <p className="text-gray-600 text-lg">
          Sélectionnez la catégorie appropriée pour cet élément
        </p>
      </div>
    </div>
  );
};

export default GameCard;