import React from 'react';
import { Play } from 'lucide-react';

interface Quiz {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

interface QuizCardProps {
  quiz: Quiz;
  onClick: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group overflow-hidden border-2 border-green-200 group-hover:text-green-300 mb-2 sm:mb-0"
    >
      <div className="p-4 sm:p-8">
        <div className="flex items-start justify-between mb-2 sm:mb-4">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-green-600 transition-colors duration-200">
              {quiz.name}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {quiz.description}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 sm:mt-6">
          <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center space-x-1">
            </div>
          </div>
          <div className="flex items-center space-x-2 text-green-600 font-semibold group-hover:text-green-700 transition-colors duration-200 text-sm sm:text-base">
            <Play className="w-5 h-5" />
            <span>Commencer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;