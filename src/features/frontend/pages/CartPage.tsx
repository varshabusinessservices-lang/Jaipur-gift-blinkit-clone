import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopStore } from '../store/shopStore';
import { ShoppingBag, Trash2, ArrowRight, Tag, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useShopStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = cart.reduce((acc, item) => {
    const price = item.selectedVariation ? item.selectedVariation.price : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax - discount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'JAIPUR100') {
      setDiscount(100);
      setCouponApplied(true);
    } else if (couponCode.toUpperCase() === 'FIRST200') {
      setDiscount(200);
      setCouponApplied(true);
    } else {
      alert('Invalid coupon code. Try JAIPUR100 or FIRST200');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500">Discover exquisite gifts and get them delivered in 10 minutes.</p>
        </div>
        <Button onClick={() => navigate('/')} className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg">
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Express Bag</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">My Shopping Cart ({cart.length})</h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => {
            const cartItemId = `${item.product.id}-${item.selectedVariation?.id || 'base'}-${idx}`;
            const itemPrice = item.selectedVariation ? item.selectedVariation.price : item.product.price;
            return (
              <div
                key={cartItemId}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{item.product.name}</h3>
                    {item.selectedVariation && (
                      <span className="text-[11px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
                        {item.selectedVariation.name}
                      </span>
                    )}
                    {item.giftMessage && (
                      <p className="text-[11px] text-slate-500 italic">Card Message: "{item.giftMessage}"</p>
                    )}
                    <div className="text-sm font-black text-slate-900 dark:text-white">₹{itemPrice}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                    <button
                      onClick={() => updateQuantity(cartItemId, item.quantity - 1)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-black text-slate-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(cartItemId, item.quantity + 1)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(cartItemId)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout Sidebar */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-4 w-4 text-indigo-600" /> Apply Coupon Code
            </h3>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Try JAIPUR100"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 outline-none uppercase font-bold"
              />
              <Button type="submit" className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold px-4 py-3 rounded-xl">
                Apply
              </Button>
            </form>
            {couponApplied && (
              <p className="text-xs font-bold text-emerald-600">Coupon applied successfully! Saved ₹{discount}</p>
            )}
          </div>

          {/* Bill Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Bill Details</h3>
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Express Delivery Fee</span>
                <span className="font-bold text-slate-900 dark:text-white">{deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST (5%)</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{tax}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between text-base font-black text-slate-900 dark:text-white">
                <span>To Pay</span>
                <span>₹{total}</span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
