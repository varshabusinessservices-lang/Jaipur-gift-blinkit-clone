import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { useShopStore } from '../store/shopStore';
import { PromoStrip } from '../components/mobile/PromoStrip';
import { MobileBottomNav } from '../components/mobile/MobileBottomNav';
import { ThemeProvider } from '../../theme/components/ThemeProvider';

export const PublicLayout = () => {
  const { toasts, removeToast } = useShopStore();

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans transition-colors pb-16 md:pb-0">
        <PromoStrip />
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <MobileBottomNav />

        {/* Toast Notifications Container */}
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs font-bold text-white transition-all transform animate-in slide-in-from-bottom-5 ${
                toast.type === 'error' ? 'bg-rose-600' : toast.type === 'info' ? 'bg-slate-800' : 'bg-emerald-600'
              }`}
            >
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/80 hover:text-white font-black text-sm"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </ThemeProvider>
  );
};

