import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { ToastContainer } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';
import { useShopStore } from '../store/shopStore';
import { clsx } from 'clsx';

interface PublicLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const PublicLayout = ({ children, title, description }: PublicLayoutProps) => {
  const { theme } = useShopStore();

  return (
    <div className={clsx('min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors', theme === 'dark' && 'dark')}>
      <SEO title={title} description={description} />
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};
