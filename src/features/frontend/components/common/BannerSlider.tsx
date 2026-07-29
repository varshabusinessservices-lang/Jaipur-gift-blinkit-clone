import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopStore } from '../../store/shopStore';
import { Zap, Clock, ShieldCheck, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const BannerSlider = () => {
  const { banners, setSelectedCategory } = useShopStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, banners.length]);

  if (!banners.length) return null;

  const currentBanner = banners[activeIndex];

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-xl min-h-[360px] sm:min-h-[400px] flex flex-col justify-between p-6 sm:p-12">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top badge */}
        <div className="relative z-10">
          <span className="bg-indigo-600/50 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 fill-current" /> {currentBanner.badgeText || 'Lightning Fast 10-Min Delivery'}
          </span>
        </div>

        {/* Content */}
        <div className="max-w-xl space-y-4 relative z-10 my-auto">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {currentBanner.title}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {currentBanner.subtitle}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => {
                if (currentBanner.linkCategory) {
                  setSelectedCategory(currentBanner.linkCategory);
                  navigate(`/category/${currentBanner.linkCategory}`);
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 shadow-lg"
            >
              Shop Collection
            </Button>
          </div>
        </div>

        {/* Navigation Arrows & Dots */}
        <div className="absolute bottom-6 right-8 flex items-center gap-4 z-10">
          <div className="flex items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`transition-all rounded-full ${activeIndex === idx ? 'bg-indigo-400 w-8 h-2.5' : 'bg-white/40 w-2.5 h-2.5'}`}
              />
            ))}
          </div>
          <div className="flex gap-1.5 ml-2">
            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % banners.length)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Trust bar */}
        <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-white/10 text-xs sm:text-sm text-slate-300 relative z-10">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>10 Minutes Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>100% Fresh & Authentic</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-rose-400 shrink-0" />
            <span>Free Gift Message & Wrap</span>
          </div>
        </div>
      </div>
    </section>
  );
};
