import React from 'react';
import { Play, Users, Calendar } from 'lucide-react';

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
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group overflow-hidden"
    >
      <div className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-200">
              {quiz.name}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {quiz.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>Actif</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Nouveau</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-green-600 font-semibold group-hover:text-green-700 transition-colors duration-200">
            <Play className="w-5 h-5" />
            <span>Commencer</span>
          </div>
        </div>
      </div>
      
      <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 group-hover:from-green-500 group-hover:to-green-700 transition-all duration-300"></div>
    </div>
  );
};

export default QuizCard;