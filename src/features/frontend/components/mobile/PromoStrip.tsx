import React, { useState, useEffect } from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';

export const PromoStrip = () => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('jaipur_promo_dismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('jaipur_promo_dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white px-4 py-2 text-xs font-bold flex items-center justify-between gap-2 shadow-sm relative z-40">
      <div className="flex items-center gap-2 truncate">
        <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Offer
        </span>
        <span className="truncate">Use code <strong className="underline">JAIPUR10</strong> for Flat 10% OFF on 10-Min Delivery in Jaipur!</span>
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0 text-white/80 hover:text-white"
        aria-label="Close promotional banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
