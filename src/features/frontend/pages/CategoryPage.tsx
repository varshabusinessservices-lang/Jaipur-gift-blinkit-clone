import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShopStore } from '../store/shopStore';
import { ProductCard } from '../components/ui/ProductCard';
import { CategorySlider } from '../components/common/CategorySlider';
import { ArrowLeft, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { categories, products } = useShopStore();

  const currentCategory = categories.find(c => c.slug === slug);
  const categoryName = currentCategory ? currentCategory.name : slug?.replace('-', ' ');

  const filteredProducts = products.filter(p => {
    if (!slug) return true;
    return p.category.toLowerCase() === categoryName?.toLowerCase() || p.category.toLowerCase().includes(slug.replace('-', ' '));
  });

  return (
    <div className="space-y-8 pb-16">
      <CategorySlider />

      {/* Category Hero Banner */}
      {currentCategory && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-12 shadow-xl flex flex-col justify-center min-h-[240px]">
            <div className="absolute inset-0 opacity-40">
              <img src={currentCategory.desktopBannerUrl || currentCategory.imageUrl} alt={currentCategory.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
            <div className="relative z-10 space-y-2 max-w-lg">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 mb-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </button>
              <h1 className="text-3xl sm:text-4xl font-black capitalize">{currentCategory.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Explore Jaipur's finest collection of {currentCategory.name.toLowerCase()} delivered in 10 minutes with free gift message & luxury packaging.
              </p>
              <div className="pt-2 text-xs font-extrabold text-indigo-400">
                {filteredProducts.length} items available
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white capitalize">
            {categoryName} Products
          </h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-sm text-slate-500">No products found in this category.</p>
            <Button onClick={() => navigate('/')} className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl">
              Return to Home
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
