import React, { useState } from 'react';
import { useShopStore } from '../../store/shopStore';
import { MapPin, Search, ShoppingBag, Heart, User, Sun, Moon, ChevronDown, Sparkles } from 'lucide-react';
import { GoogleMapsLocationModal } from './GoogleMapsLocationModal';

export const Header = () => {
  const { currentLocation, setLocationModalOpen, cart, wishlist, theme, setTheme } = useShopStore();
  const [searchQuery, setSearchQuery] = useState('');

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleThemeMode = () => {
    if (theme === 'light') setTheme('dark');
    else setTheme('light');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Location Selector */}
          <div className="flex items-center gap-6 shrink-0">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md font-black text-xl">
                JG
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">Jaipur Gifting</span>
                <span className="block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">10-Min Delivery</span>
              </div>
            </a>

            <button
              onClick={() => setLocationModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left cursor-pointer max-w-xs"
            >
              <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Delivery in 10 mins</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">{currentLocation.address}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-grow max-w-xl hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search for luxury mithai, flowers, cakes, corporate gifts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Actions & Navigation */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleThemeMode}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => alert('Wishlist drawer open')}
              className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Wishlist"
            >
              <Heart className="h-4 w-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => alert('Cart drawer open')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalCartItems > 0 && (
                <span className="bg-white text-indigo-600 px-2 py-0.5 rounded-lg text-xs font-extrabold">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              onClick={() => alert('Profile modal open')}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Account"
            >
              <User className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <GoogleMapsLocationModal />
    </>
  );
};
