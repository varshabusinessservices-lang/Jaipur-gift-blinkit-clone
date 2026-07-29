import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopStore } from '../store/shopStore';
import { MapPin, ShieldCheck, Clock, CheckCircle2, Sparkles, ArrowRight, CreditCard, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const CheckoutPage = () => {
  const { cart, currentUser, addAddress, clearCart, addToast } = useShopStore();
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState(currentUser?.addresses[0]?.id || 'addr-1');
  const [paymentMode, setPaymentMode] = useState<'razorpay' | 'cod' | 'wallet'>('razorpay');
  const [loading, setLoading] = useState(false);

  // New address state
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [title, setTitle] = useState('Work');
  const [fullAddress, setFullAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('302017');

  const subtotal = cart.reduce((acc, item) => {
    const price = item.selectedVariation ? item.selectedVariation.price : item.product.price;
    return acc + price * item.quantity;
  }, 0);
  const deliveryFee = subtotal > 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullAddress) return;
    addAddress({ title, fullAddress, landmark, pincode, isDefault: false });
    setShowNewAddress(false);
    setFullAddress('');
    setLandmark('');
  };

  const handlePlaceOrder = () => {
    if (!currentUser) {
      addToast('Please login to place order', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      clearCart();
      addToast('Order placed successfully! Delivering in 10 mins.', 'success');
      navigate('/profile/orders');
    }, 1200);
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Express Checkout</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Select Delivery & Payment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address Section */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-600" /> Delivery Address in Jaipur
              </h3>
              <button
                onClick={() => setShowNewAddress(!showNewAddress)}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                {showNewAddress ? 'Cancel' : '+ Add New Address'}
              </button>
            </div>

            {showNewAddress && (
              <form onSubmit={handleAddAddressSubmit} className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Address Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
                    <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Street Address</label>
                  <input type="text" placeholder="e.g. 45, Rajendra Marg, Bapu Nagar" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none" required />
                </div>
                <Button type="submit" className="bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl">
                  Save Address
                </Button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentUser?.addresses.map(addr => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-100' : 'border-slate-200 dark:border-slate-800'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">{addr.title}</span>
                    {addr.isDefault && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold">Default</span>}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{addr.fullAddress}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Pincode: {addr.pincode}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Slot */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" /> Delivery Slot
            </h3>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Express 10-Minute Delivery</h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">Delivered instantly right to your doorstep in Jaipur</p>
                </div>
              </div>
              <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full">FREE</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-600" /> Payment Method
            </h3>
            <div className="space-y-3">
              <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${paymentMode === 'razorpay' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-100' : 'border-slate-200 dark:border-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" checked={paymentMode === 'razorpay'} onChange={() => setPaymentMode('razorpay')} />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Razorpay Secure Checkout</div>
                    <div className="text-[11px] text-slate-500">UPI, Credit/Debit Card, NetBanking, Wallets</div>
                  </div>
                </div>
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
              </label>

              <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${paymentMode === 'cod' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-100' : 'border-slate-200 dark:border-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" checked={paymentMode === 'cod'} onChange={() => setPaymentMode('cod')} />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Cash on Delivery (COD)</div>
                    <div className="text-[11px] text-slate-500">Pay cash upon delivery at your doorstep</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Order Summary</h3>
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{tax}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between text-base font-black text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? 'Processing Order...' : <>Place Order • ₹{total}</>} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
