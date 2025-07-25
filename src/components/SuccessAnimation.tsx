import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessAnimationProps {
  isVisible: boolean;
  message?: string;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ 
  isVisible, 
  message = "Réponse enregistrée !" 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl p-8 transform animate-bounce">
        <div className="flex items-center justify-center space-x-3">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <span className="text-xl font-semibold text-gray-900">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default SuccessAnimation;