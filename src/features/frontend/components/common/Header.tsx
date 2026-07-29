import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopStore } from '../../store/shopStore';
import { MapPin, Search, Heart, ShoppingBag, User, Sun, Moon, Sparkles, Menu, X, ChevronDown, Package, HelpCircle, Tag } from 'lucide-react';
import { LoginModal } from './LoginModal';
import { Button } from '../ui/Button';

export const Header = () => {
  const {
    currentLocation,
    setLocationModalOpen,
    cart,
    wishlist,
    setCartDrawerOpen,
    setWishlistDrawerOpen,
    currentUser,
    setLoginModalOpen,
    logout,
    theme,
    setTheme,
    products,
    searchQuery,
    setSearchQuery
  } = useShopStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Search suggestions
  const searchResults = searchQuery.trim()
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        {/* Top Utility Row */}
        <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60 py-1.5 px-4 sm:px-8 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{currentLocation.address}</span>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-extrabold">10 MINS</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/profile/orders" className="hover:text-indigo-600 flex items-center gap-1">
              <Package className="h-3.5 w-3.5" /> Track Order
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link to="/profile" className="hover:text-indigo-600 flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" /> Customer Support
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-indigo-600 font-semibold flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> Express Gifting Offers
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Main Header Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white block leading-none">Jaipur Gifting</span>
                <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">10-Min Delivery</span>
              </div>
            </Link>
          </div>

          {/* Large Search Bar */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl relative">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search for photo frames, mugs, jewellery, bottles, birthdays..."
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-600 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all"
              />
            </div>

            {/* Search Suggestions Dropdown */}
            {searchFocused && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="p-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3">
                  Matching Products ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-4 text-xs text-slate-500 text-center">No products found.</div>
                ) : (
                  searchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setSearchQuery('');
                        setSearchFocused(false);
                        navigate(`/product/${prod.slug}`);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-t border-slate-100 dark:border-slate-800 transition-colors"
                    >
                      <img src={prod.imageUrl} alt={prod.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{prod.name}</h4>
                        <span className="text-[10px] text-slate-500">{prod.category} • ₹{prod.price}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <button
              onClick={() => navigate('/wishlist')}
              className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors flex items-center gap-2 px-3.5"
              title="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xs font-black">{totalCartCount} items</span>
            </button>

            {/* Profile / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden lg:block text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/profile/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={() => setLoginModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>
      <LoginModal />
    </>
  );
};
