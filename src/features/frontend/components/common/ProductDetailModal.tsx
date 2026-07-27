import React, { useState } from 'react';
import { useShopStore } from '../../store/shopStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ProductVariation } from '../../types';
import { Star, Clock, Heart, ShoppingBag, Sparkles, Check, MessageSquare } from 'lucide-react';

export const ProductDetailModal = () => {
  const { activeProductModal, setActiveProductModal, addToCart, toggleWishlist, isInWishlist } = useShopStore();
  const [selectedVar, setSelectedVar] = useState<ProductVariation | undefined>(
    activeProductModal?.variations?.[0]
  );
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  if (!activeProductModal) return null;

  const favorited = isInWishlist(activeProductModal.id);
  const currentPrice = selectedVar ? selectedVar.price : activeProductModal.price;
  const originalPrice = selectedVar ? selectedVar.originalPrice : activeProductModal.originalPrice;

  const handleAdd = () => {
    addToCart(
      activeProductModal,
      1,
      selectedVar,
      activeProductModal.isPersonalisable ? { recipientName, giftMessage } : undefined
    );
    setActiveProductModal(null);
  };

  return (
    <Modal
      isOpen={!!activeProductModal}
      onClose={() => setActiveProductModal(null)}
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={activeProductModal.imageUrl}
            alt={activeProductModal.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {activeProductModal.discountBadge && (
            <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
              {activeProductModal.discountBadge}
            </span>
          )}
        </div>

        {/* Product Details & Options */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                {activeProductModal.category}
              </span>
              <button
                onClick={() => toggleWishlist(activeProductModal)}
                className={`p-2 rounded-full border border-slate-200 dark:border-slate-800 transition-colors ${favorited ? 'text-red-500 bg-red-50' : 'text-slate-600 hover:text-red-500'}`}
              >
                <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h2 className="text-xl font-black text-slate-900 dark:text-white">{activeProductModal.name}</h2>
            <p className="text-xs text-slate-500">{activeProductModal.subtitle}</p>

            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">₹{currentPrice}</span>
                {originalPrice && <span className="text-sm text-slate-400 line-through">₹{originalPrice}</span>}
              </div>
              <span className="flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {activeProductModal.rating} ({activeProductModal.reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl">
              <Clock className="h-4 w-4" /> Delivered in {activeProductModal.deliveryTime} across Jaipur
            </div>

            {/* Tabs for Details / 5 Reviews */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 px-3 border-b-2 transition-colors ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
              >
                Product Options & Personalisation
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 px-3 border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
              >
                Customer Reviews ({activeProductModal.reviews.length})
              </button>
            </div>

            {activeTab === 'details' ? (
              <div className="space-y-4 pt-2">
                {/* Variations if available */}
                {activeProductModal.productType === 'variation' && activeProductModal.variations && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Edition / Option:</label>
                    <div className="grid grid-cols-1 gap-2">
                      {activeProductModal.variations.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVar(v)}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${selectedVar?.id === v.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 font-bold' : 'border-slate-200 dark:border-slate-800'}`}
                        >
                          <span>{v.name}</span>
                          <span className="text-indigo-600 font-extrabold">₹{v.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personalisation fields */}
                {activeProductModal.isPersonalisable && (
                  <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                      <Sparkles className="h-4 w-4" /> Personalise Your Gift
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Recipient Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Aarav & Priya"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Gift Message (Free)</label>
                      <input
                        type="text"
                        placeholder="e.g. Wishing you a wonderful anniversary!"
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 pt-2 max-h-56 overflow-y-auto">
                {activeProductModal.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.author}</span>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setActiveProductModal(null)}
              className="w-1/3"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 font-bold"
            >
              <ShoppingBag className="h-4 w-4" /> Add to Cart • ₹{currentPrice}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
