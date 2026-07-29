import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

export const OccasionSlider = () => {
  const navigate = useNavigate();

  const occasions = [
    {
      id: 'occ-1',
      title: 'Birthday',
      subtitle: 'Cakes, Hampers & Frames',
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop',
      slug: 'birthday-gifts',
      color: 'from-pink-500/10 to-rose-500/20'
    },
    {
      id: 'occ-2',
      title: 'Anniversary',
      subtitle: 'Romantic Keepsakes',
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&auto=format&fit=crop',
      slug: 'anniversary-gifts',
      color: 'from-purple-500/10 to-indigo-500/20'
    },
    {
      id: 'occ-3',
      title: 'Raksha Bandhan',
      subtitle: 'Sweets & Hampers',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop',
      slug: 'rakhi-special',
      color: 'from-amber-500/15 to-orange-500/20'
    },
    {
      id: 'occ-4',
      title: 'Wedding',
      subtitle: 'Luxurious Box Sets',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop',
      slug: 'wedding-gifts',
      color: 'from-emerald-500/10 to-teal-500/20'
    },
    {
      id: 'occ-5',
      title: 'Housewarming',
      subtitle: 'Decor & Lamps',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop',
      slug: 'home-decor',
      color: 'from-blue-500/10 to-cyan-500/20'
    }
  ];

  return (
    <section className="py-4 space-y-4">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Special Moments
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">Gifts for Every Occasion</h2>
        </div>
      </div>

      <div
        className="flex items-center gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {occasions.map((occ) => (
          <div
            key={occ.id}
            onClick={() => navigate(`/category/${occ.slug}`)}
            className={`min-w-[200px] sm:min-w-[240px] p-4 rounded-3xl bg-gradient-to-br ${occ.color} border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:scale-[1.02] transition-transform shadow-sm flex items-center gap-3 shrink-0`}
          >
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-inner">
              <OptimizedImage src={occ.image} alt={occ.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 truncate">
              <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">{occ.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{occ.subtitle}</p>
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                Explore <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
