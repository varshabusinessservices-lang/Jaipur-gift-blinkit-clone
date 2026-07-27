import React, { useState } from 'react';
import { PublicLayout } from '../layouts/PublicLayout';
import { ProductCard } from '../components/ui/ProductCard';
import { CategoryCard } from '../components/ui/CategoryCard';
import { Button } from '../components/ui/Button';
import { useShopStore } from '../store/shopStore';
import { ProductDetailModal } from '../components/common/ProductDetailModal';
import { Zap, Clock, ShieldCheck, Gift, Flame, Award, ChevronRight, ChevronLeft, SlidersHorizontal, Sparkles } from 'lucide-react';

export function HomePage() {
  const { categories, products, banners, selectedCategory, setSelectedCategory, productTypeFilter, setProductTypeFilter, searchQuery } = useShopStore();
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Filter products based on selected category, product type filter, and search query
  const filteredProducts = products.filter(p => {
    if (selectedCategory) {
      const catObj = categories.find(c => c.slug === selectedCategory);
      if (catObj && p.category !== catObj.name) return false;
    }
    if (productTypeFilter !== 'all' && p.productType !== productTypeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <PublicLayout title="Jaipur Gifting | 10-Minute Luxury Gifting & Personalised Keepsakes">
      <div className="space-y-12 pb-16 bg-white dark:bg-slate-950">

        {/* Hero Banner Slider */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-2xl p-8 sm:p-14 min-h-[380px] flex flex-col justify-center">
            <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="max-w-xl space-y-4 relative z-10">
              <span className="bg-indigo-600/40 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 fill-current" /> {banners[activeBannerIndex]?.badgeText || 'Lightning Fast 10-Min Delivery'}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {banners[activeBannerIndex]?.title || 'Express Luxury Gifting & Personalised Keepsakes'}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {banners[activeBannerIndex]?.subtitle || 'Handcrafted photo frames, custom mugs, jewellery, bottles and birthday gifts delivered in 10 minutes.'}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  onClick={() => {
                    const cat = banners[activeBannerIndex]?.linkCategory;
                    const found = categories.find(c => c.name === cat);
                    if (found) setSelectedCategory(found.slug);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 shadow-lg"
                >
                  Shop Featured Collection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory(null)}
                  className="border-white/30 text-white hover:bg-white/10 font-bold px-6 py-3"
                >
                  View All Categories
                </Button>
              </div>
            </div>

            {/* Banner Carousel Dots */}
            <div className="absolute bottom-6 right-8 flex items-center gap-2 z-10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBannerIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${activeBannerIndex === idx ? 'bg-indigo-400 w-8' : 'bg-white/40'}`}
                />
              ))}
            </div>

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-white/10 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>10 Minutes Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>100% Fresh & Authentic</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-rose-400 shrink-0" />
                <span>Free Gift Message & Wrap</span>
              </div>
            </div>
          </div>
        </section>

        {/* Category Icon Section (Rounded image cards with labels) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Explore Categories</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Customised gifts, Jewellery, Mugs, Photo Frames, Bottles & more</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${!selectedCategory ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                All Categories
              </button>
            </div>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
                className={`transition-all ${selectedCategory === cat.slug ? 'ring-2 ring-indigo-600 rounded-2xl' : ''}`}
              >
                <CategoryCard category={cat} />
              </div>
            ))}
          </div>
        </section>

        {/* Product Filter Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedCategory ? `Category: ${categories.find(c => c.slug === selectedCategory)?.name}` : 'All Categories'}
                <span className="text-xs font-normal text-slate-500 ml-2">({filteredProducts.length} items found)</span>
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500">Filter Type:</span>
              <button
                onClick={() => setProductTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${productTypeFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
              >
                All (6/cat)
              </button>
              <button
                onClick={() => setProductTypeFilter('single')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${productTypeFilter === 'single' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
              >
                Single (3)
              </button>
              <button
                onClick={() => setProductTypeFilter('variation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${productTypeFilter === 'variation' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
              >
                Variation (3)
              </button>
            </div>
          </div>
        </section>

        {/* Featured Collections / Products Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Flame className="h-5 w-5 fill-indigo-500 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name : 'Featured & Trending Collections'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">6 items per category with 5 verified reviews each</p>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 font-semibold">No products found matching your filter.</p>
              <Button onClick={() => { setSelectedCategory(null); setProductTypeFilter('all'); }} className="mt-4">
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Corporate Gifting Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="space-y-3 max-w-lg relative z-10 text-center md:text-left">
              <span className="bg-indigo-600/50 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
                Corporate & Bulk Gifting in Jaipur
              </span>
              <h2 className="text-2xl sm:text-4xl font-black">Custom Branded Mugs, Bottles, Jewellery & Hampers</h2>
              <p className="text-slate-300 text-sm">
                Get custom corporate logo engraving on bottles, mugs, mouse pads and photo frames delivered in 10 minutes.
              </p>
            </div>
            <div className="relative z-10 shrink-0">
              <Button className="bg-white text-slate-900 hover:bg-slate-100 font-extrabold px-8 py-4 shadow-xl">
                Get Bulk Quote in 2 Mins
              </Button>
            </div>
          </div>
        </section>

      </div>
      <ProductDetailModal />
    </PublicLayout>
  );
}
