import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Sparkles } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

export const RecipientGrid = () => {
  const navigate = useNavigate();

  const recipients = [
    { title: 'For Him', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop', slug: 'gifts-for-him' },
    { title: 'For Her', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop', slug: 'gifts-for-her' },
    { title: 'Kids & Teens', image: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=400&auto=format&fit=crop', slug: 'kids-toys' },
    { title: 'Wife', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop', slug: 'gifts-for-wife' },
    { title: 'Husband', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop', slug: 'gifts-for-husband' },
    { title: 'Parents', image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&auto=format&fit=crop', slug: 'parents-gifts' }
  ];

  return (
    <section className="py-4 space-y-4">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Curated By Recipient
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">Shop by Recipient</h2>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 px-4 sm:px-6 lg:px-8">
        {recipients.map((rec, idx) => (
          <div
            key={idx}
            onClick={() => navigate(`/category/${rec.slug}`)}
            className="group cursor-pointer flex flex-col items-center text-center space-y-2"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-sm group-hover:border-indigo-600 transition-all">
              <OptimizedImage src={rec.image} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 truncate w-full">{rec.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
