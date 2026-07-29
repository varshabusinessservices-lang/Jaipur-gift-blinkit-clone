import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Gift, Flame, Clock, Heart, Zap, Tag } from 'lucide-react';

export const QuickFilterRow = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const filters = [
    { label: 'All Gifts', icon: Gift, slug: null },
    { label: 'Personalized', icon: Sparkles, slug: 'personalised-photo-gifts' },
    { label: 'Photo Frames', icon: Heart, slug: 'photo-frames' },
    { label: 'Mugs & Cups', icon: Tag, slug: 'mugs-sippers' },
    { label: 'Same Day', icon: Clock, slug: null, filterParam: 'sameday' },
    { label: 'Bestsellers', icon: Flame, slug: null, filterParam: 'bestseller' },
    { label: 'New Arrivals', icon: Zap, slug: null, filterParam: 'new' },
  ];

  const handleFilterClick = (filter: typeof filters[0]) => {
    if (filter.slug) {
      navigate(`/category/${filter.slug}`);
    } else {
      navigate('/category/gift-hampers');
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 py-3 border-b border-slate-100 dark:border-slate-800">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filters.map((f, idx) => {
          const Icon = f.icon;
          return (
            <button
              key={idx}
              onClick={() => handleFilterClick(f)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-600 hover:text-indigo-600 shrink-0 transition-all shadow-2xs active:scale-95"
            >
              <Icon className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="whitespace-nowrap">{f.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
