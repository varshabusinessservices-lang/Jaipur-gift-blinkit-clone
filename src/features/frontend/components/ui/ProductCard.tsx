import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { useShopStore } from '../../store/shopStore';
import { Heart, Star, Clock, Plus, Zap } from 'lucide-react';
import { Button } from './Button';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useShopStore();
  const inWishlist = isInWishlist(product.id);

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image Container */}
        <div
          onClick={handleCardClick}
          className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />

          {/* Top badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
            {product.discountBadge && (
              <span className="bg-rose-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm">
                {product.discountBadge}
              </span>
            )}
            {product.isPersonalisable && (
              <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Zap className="h-3 w-3 fill-current" /> Customisable
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-transform active:scale-95 ${inWishlist ? 'text-red-500' : 'text-slate-600 dark:text-slate-300 hover:text-red-500'}`}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Delivery Time Badge */}
          <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
            <Clock className="h-3 w-3 text-indigo-400" /> {product.deliveryTime}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          {/* Rating */}
          <div className="flex items-center gap-1 text-xs">
            <div className="flex items-center text-amber-500 font-bold">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="ml-1">{product.rating}</span>
            </div>
            <span className="text-slate-400">({product.reviewCount})</span>
          </div>

          <h3
            onClick={handleCardClick}
            className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 cursor-pointer hover:text-indigo-600 transition-colors"
          >
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-1">{product.subtitle}</p>
        </div>
      </div>

      {/* Footer Price & Add */}
      <div className="p-4 pt-0 flex items-center justify-between">
        <div>
          <div className="text-base font-black text-slate-900 dark:text-white">
            ₹{product.price}
          </div>
          {product.originalPrice && (
            <div className="text-xs text-slate-400 line-through">
              ₹{product.originalPrice}
            </div>
          )}
        </div>

        <Button
          onClick={() => {
            if (product.isPersonalisable || product.productType === 'variation') {
              navigate(`/product/${product.slug}`);
            } else {
              addToCart(product);
            }
          }}
          className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:hover:bg-indigo-600 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1"
        >
          {product.isPersonalisable ? 'Customise' : <><Plus className="h-3.5 w-3.5" /> ADD</>}
        </Button>
      </div>
    </div>
  );
};
