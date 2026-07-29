import React from 'react';
import { Tag, Copy, Sparkles, Check } from 'lucide-react';
import { useShopStore } from '../../store/shopStore';

export const OfferSlider = () => {
  const { addToast } = useShopStore();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const offers = [
    {
      id: 'off-1',
      title: 'Flat 10% OFF on Express Gifts',
      code: 'JAIPUR10',
      minOrder: '₹499',
      expiry: 'Valid till 31st July',
      bg: 'bg-indigo-600 text-white'
    },
    {
      id: 'off-2',
      title: 'Free Delivery on Orders Above ₹499',
      code: 'FREEDEL',
      minOrder: '₹499',
      expiry: 'Always Active',
      bg: 'bg-emerald-600 text-white'
    },
    {
      id: 'off-3',
      title: '₹150 OFF on Personalised Frames',
      code: 'FRAME150',
      minOrder: '₹999',
      expiry: 'Limited Period',
      bg: 'bg-purple-600 text-white'
    }
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Coupon code ${code} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="py-4 space-y-4">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" /> Savings & Deals
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">Exclusive Jaipur Offers</h2>
        </div>
      </div>

      <div
        className="flex items-center gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`min-w-[260px] sm:min-w-[300px] p-5 rounded-3xl ${offer.bg} shadow-md relative overflow-hidden flex flex-col justify-between shrink-0`}
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
            <div className="space-y-1.5">
              <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Coupon Deal
              </span>
              <h3 className="text-sm font-black text-white">{offer.title}</h3>
              <p className="text-[11px] text-white/80">Min order {offer.minOrder} • {offer.expiry}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
              <span className="font-mono text-xs font-black tracking-widest bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                {offer.code}
              </span>
              <button
                onClick={() => handleCopy(offer.code)}
                className="bg-white text-slate-900 text-xs font-black px-3.5 py-1.5 rounded-xl shadow-sm hover:bg-slate-100 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                {copiedCode === offer.code ? <><Check className="h-3 w-3 text-emerald-600" /> Copied</> : <><Copy className="h-3 w-3" /> Copy Code</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
