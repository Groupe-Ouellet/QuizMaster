import React from 'react';

interface Category {
  id: number;
  name: string;
  quiz_id: number;
}

interface CategoryButtonProps {
  category: Category;
  onClick: () => void;
  isSelected?: boolean;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ category, onClick, isSelected = false }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full px-6 py-4 rounded-xl font-semibold text-lg
        transition-all duration-300 transform hover:scale-105
        ${isSelected 
          ? 'bg-green-500 text-white shadow-lg' 
          : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border-2 border-gray-200 hover:border-green-300'
        }
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        shadow-md hover:shadow-lg
      `}
    >
      {category.name}
    </button>
  );
};

export default CategoryButton;