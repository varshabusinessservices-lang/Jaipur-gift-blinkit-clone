import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Grid, Package, Heart, User, ShoppingBag } from 'lucide-react';
import { useShopStore } from '../../store/shopStore';

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, wishlist, currentUser } = useShopStore();

  const totalCart = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Categories', path: '/category/gift-hampers', icon: Grid },
    { label: 'Orders', path: '/profile/orders', icon: Package },
    { label: 'Wishlist', path: '/wishlist', icon: Heart, badge: wishlist.length },
    { label: 'Account', path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg pb-safe">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
                isActive ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-indigo-600 rounded-full" />
              )}
              <div className="relative mt-1">
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[60px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
