import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopStore } from '../store/shopStore';
import { ProductCard } from '../components/ui/ProductCard';
import { Heart, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const WishlistPage = () => {
  const { wishlist } = useShopStore();
  const navigate = useNavigate();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
          <Heart className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Wishlist is Empty</h2>
          <p className="text-xs text-slate-500">Save your favorite customised gifts and jewellery items here.</p>
        </div>
        <Button onClick={() => navigate('/')} className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg">
          Explore Gifts
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
            <Heart className="h-4 w-4 fill-current" /> Saved Favorites
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">My Wishlist ({wishlist.length})</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
