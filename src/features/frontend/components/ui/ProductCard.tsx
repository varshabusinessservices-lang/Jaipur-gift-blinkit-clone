import React from 'react';
import { Product } from '../../types';
import { useShopStore } from '../../store/shopStore';
import { Star, Clock, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, toggleWishlist, isInWishlist, setActiveProductModal } = useShopStore();
  const favorited = isInWishlist(product.id);

  return (
    <Card
      hoverEffect
      onClick={() => setActiveProductModal(product)}
      className="group flex flex-col overflow-hidden relative cursor-pointer"
    >
      {/* Discount & Wishlist Badges */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
        {product.discountBadge ? (
          <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
            {product.discountBadge}
          </span>
        ) : <span />}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/90 backdrop-blur-sm shadow-sm ${favorited ? 'text-red-500' : 'text-slate-600 hover:text-red-500'}`}
          title="Save to Wishlist"
        >
          <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        {product.isPersonalisable && (
          <div className="absolute bottom-2 left-2 bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Customisable
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium">
              <Clock className="h-3 w-3 text-indigo-600" /> {product.deliveryTime}
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {product.rating} ({product.reviewCount})
            </span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{product.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{product.subtitle}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900 dark:text-white">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
              )}
            </div>
          </div>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (product.productType === 'variation') {
                setActiveProductModal(product);
              } else {
                addToCart(product);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> ADD
          </Button>
        </div>
      </div>
    </Card>
  );
};
