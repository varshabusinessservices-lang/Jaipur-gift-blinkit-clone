import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopStore } from '../../store/shopStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CategorySlider = () => {
  const { categories, selectedCategory, setSelectedCategory } = useShopStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    navigate(`/category/${slug}`);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div
        ref={scrollRef}
        className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className="flex flex-col items-center shrink-0 cursor-pointer group w-20 sm:w-24 text-center"
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition-all duration-200 shadow-sm ${isSelected ? 'border-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950 scale-105' : 'border-slate-200 dark:border-slate-800 group-hover:border-indigo-400 group-hover:scale-105'}`}>
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className={`text-xs mt-2 font-semibold line-clamp-1 transition-colors ${isSelected ? 'text-indigo-600 font-bold' : 'text-slate-800 dark:text-slate-200 group-hover:text-indigo-600'}`}>
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
