import React from 'react';
import { Category } from '../../types';
import { Card } from './Card';

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
}

export const CategoryCard = ({ category, onClick }: CategoryCardProps) => {
  return (
    <Card
      hoverEffect
      onClick={onClick}
      className="group cursor-pointer p-4 flex flex-col items-center text-center space-y-3 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/80"
    >
      <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-slate-800 p-2 overflow-hidden shadow-inner flex items-center justify-center">
        <img
          src={category.imageUrl}
          alt={category.name}
          className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
      </div>
      <div>
        <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">{category.name}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{category.itemCount} items</p>
      </div>
    </Card>
  );
};
