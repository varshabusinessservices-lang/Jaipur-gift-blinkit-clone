import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopStore } from '../store/shopStore';
import { User, Phone, Mail, MapPin, Wallet, Package, Heart, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ProfilePage = () => {
  const { currentUser, logout, setLoginModalOpen } = useShopStore();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
          <User className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Please Login</h2>
          <p className="text-xs text-slate-500">Access your profile, wallet balance, saved addresses and order history.</p>
        </div>
        <Button onClick={() => setLoginModalOpen(true)} className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg">
          Login with Phone OTP
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">My Account</h1>
        </div>
        <Button onClick={logout} className="bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white text-xl font-black flex items-center justify-center shadow-md">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">{currentUser.name}</h3>
              <p className="text-xs text-slate-500">+91 {currentUser.phone}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <Mail className="h-4 w-4 text-indigo-600" />
              <span>{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <Wallet className="h-4 w-4 text-emerald-600" />
              <span>Wallet Balance: <strong className="text-slate-900 dark:text-white">₹{currentUser.walletBalance}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => navigate('/profile/orders')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-600 transition-colors flex items-center justify-between"
          >
            <div className="space-y-1">
              <Package className="h-6 w-6 text-indigo-600 mb-2" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white">My Orders</h4>
              <p className="text-xs text-slate-500">{currentUser.orders.length} orders placed</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/wishlist')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-600 transition-colors flex items-center justify-between"
          >
            <div className="space-y-1">
              <Heart className="h-6 w-6 text-rose-500 mb-2" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white">My Wishlist</h4>
              <p className="text-xs text-slate-500">View saved products</p>
            </div>
          </div>
        </div>
      </div>
          <div
            onClick={() => navigate("/wallet")}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-600 transition-colors flex items-center justify-between"
          >
            <div className="space-y-1">
              <Wallet className="h-6 w-6 text-emerald-500 mb-2" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white">My Wallet</h4>
              <p className="text-xs text-slate-500">View wallet balance</p>
            </div>
          </div>

          <div
            onClick={() => navigate("/rewards")}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-600 transition-colors flex items-center justify-between"
          >
            <div className="space-y-1">
              <Wallet className="h-6 w-6 text-amber-500 mb-2" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white">My Rewards</h4>
              <p className="text-xs text-slate-500">View loyalty points</p>
            </div>
          </div>

          <div
            onClick={() => navigate("/referral")}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-600 transition-colors flex items-center justify-between"
          >
            <div className="space-y-1">
              <Wallet className="h-6 w-6 text-indigo-500 mb-2" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Refer & Earn</h4>
              <p className="text-xs text-slate-500">Invite friends & earn</p>
            </div>
          </div>

      {/* Saved Addresses */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between"><h3 className="text-lg font-black text-slate-900 dark:text-white">Saved Addresses in Jaipur</h3><button onClick={() => navigate("/profile/addresses")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All</button></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {currentUser.addresses.map(addr => (
            <div key={addr.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">{addr.title}</span>
                {addr.isDefault && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold">Default</span>}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{addr.fullAddress}</p>
              <p className="text-[11px] text-slate-400">Pincode: {addr.pincode}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
