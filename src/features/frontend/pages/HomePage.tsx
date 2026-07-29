import React, { useEffect } from 'react';
import { useShopStore } from '../store/shopStore';
import { useThemeStore } from '../../theme/store/themeStore';
import { CategorySlider } from '../components/common/CategorySlider';
import { BannerSlider } from '../components/common/BannerSlider';
import { ProductCard } from '../components/ui/ProductCard';
import { Sparkles, Zap, Flame, Clock, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { OccasionSlider } from '../components/mobile/OccasionSlider';
import { OfferSlider } from '../components/mobile/OfferSlider';
import { RecipientGrid } from '../components/mobile/RecipientGrid';

const SectionRenderer: React.FC<{ section: any, products: any[] }> = ({ section, products }) => {
  if (!section.enabled) return null;

  switch (section.sectionType) {
    case 'ICON_CATEGORIES':
      return <CategorySlider />;
    case 'HERO_BANNER':
      return <BannerSlider />;
    case 'WIDE_BANNER':
      return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="w-full h-32 sm:h-48 md:h-64 bg-indigo-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-slate-700 overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
             <h3 className="text-xl sm:text-3xl font-black text-indigo-900 dark:text-indigo-400 z-10 text-center px-4">
               {section.title || 'Special Promotion'}
             </h3>
           </div>
        </section>
      );
    case 'GIFTS_FOR_EVERYONE':
    case 'RECIPIENTS':
      return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
           <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{section.title || 'Gifts for Everyone'}</h2>
          </div>
          <RecipientGrid />
        </section>
      );
    case 'OFFERS':
      return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
           <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{section.title || 'Save More with Offers'}</h2>
          </div>
          <OfferSlider />
        </section>
      );
    case 'OCCASIONS':
    case 'FEELINGS':
      return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
           <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{section.title || 'Gifts for Every Occasion'}</h2>
          </div>
          <OccasionSlider />
        </section>
      );
    case 'HIGHLIGHTS':
      return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-y border-slate-200 dark:border-slate-800 mt-12 bg-slate-50 dark:bg-slate-900/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12">
             <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                   <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Same Day Delivery</h4>
                  <p className="text-sm text-slate-500 mt-1">Available in Jaipur</p>
                </div>
             </div>
             <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Premium Quality</h4>
                  <p className="text-sm text-slate-500 mt-1">Handpicked gifts</p>
                </div>
             </div>
             <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center">
                   <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Easy Replacements</h4>
                  <p className="text-sm text-slate-500 mt-1">On damaged items</p>
                </div>
             </div>
          </div>
        </section>
      );
    case 'BESTSELLERS':
    case 'NEW_LAUNCHES':
    case 'PRODUCT_SLIDER':
      const listProducts = section.sectionType === 'BESTSELLERS' 
        ? products.filter(p => p.isBestSeller).slice(0, 4)
        : section.sectionType === 'NEW_LAUNCHES'
        ? products.filter(p => p.isNewArrival).slice(0, 4)
        : products.slice(0, 4);
      
      const Icon = section.sectionType === 'BESTSELLERS' ? Flame : section.sectionType === 'NEW_LAUNCHES' ? Zap : Sparkles;
      const colorClass = section.sectionType === 'BESTSELLERS' ? 'text-rose-600' : 'text-indigo-600';

      return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-xs font-black ${colorClass} uppercase tracking-widest flex items-center gap-1.5`}>
                <Icon className="h-4 w-4" /> {section.subtitle || 'Handpicked Collection'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{section.title}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {listProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      );
    case 'STORIES':
      return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
           <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{section.title || 'Joyful Gifting Stories'}</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="min-w-[120px] sm:min-w-[160px] aspect-[9/16] bg-slate-200 dark:bg-slate-800 rounded-xl snap-start flex-shrink-0 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <div className="absolute bottom-3 left-3 right-3 text-white">
                   <p className="text-xs font-bold leading-tight line-clamp-2">Story {i}</p>
                 </div>
              </div>
            ))}
          </div>
        </section>
      );
    default:
      return null;
  }
};

export const HomePage = () => {
  const { products } = useShopStore();
  const { activeTheme, fetchStorefrontTheme, draftTheme, previewMode } = useThemeStore();
  
  useEffect(() => {
    fetchStorefrontTheme();
  }, [fetchStorefrontTheme]);

  const theme = previewMode ? draftTheme : activeTheme;

  if (!theme) return <div className="flex justify-center p-12">Loading...</div>;

  const homePage = theme.pages?.find((p: any) => p.pageType === 'HOMEPAGE') || { sections: [] };
  const sections = [...(homePage.sections || [])].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-12 pb-16 pt-4">
      {sections.length > 0 ? (
        sections.map((section: any) => (
          <SectionRenderer key={section.id} section={section} products={products} />
        ))
      ) : (
        <div className="text-center py-20 text-slate-500">No sections found.</div>
      )}
    </div>
  );
};
