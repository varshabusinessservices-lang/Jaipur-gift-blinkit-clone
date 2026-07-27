import React, { useState } from 'react';
import { PublicLayout } from '../layouts/PublicLayout';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { ProductCard } from '../components/ui/ProductCard';
import { CategoryCard } from '../components/ui/CategoryCard';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { useShopStore } from '../store/shopStore';
import { Sparkles, Heart, ShoppingBag, MapPin, CheckCircle, AlertCircle, Info, Send } from 'lucide-react';

export function DesignSystemShowcasePage() {
  const { addToast, setLocationModalOpen } = useShopStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const sampleProduct = {
    id: 'sample-1',
    name: 'Royal Truffle Celebration Hamper',
    subtitle: 'Handcrafted artisan chocolates & gourmet cookies',
    price: 1499,
    originalPrice: 1999,
    discountBadge: '25% OFF',
    rating: 4.9,
    reviewCount: 320,
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80',
    deliveryTime: '10 mins',
    category: 'Hampers',
    isPersonalisable: true,
    productType: 'single' as const,
    reviews: [
      { id: 'r1', author: 'Aarav', rating: 5, comment: 'Amazing quality!', date: '1 day ago' },
      { id: 'r2', author: 'Priya', rating: 5, comment: 'Delivered in 10 mins!', date: '2 days ago' }
    ]
  };

  const sampleCategory = {
    id: 'cat-1',
    name: 'Luxury Mithai',
    slug: 'luxury-mithai',
    imageUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=500&q=80',
    itemCount: 42
  };

  return (
    <PublicLayout title="Design System Showcase | Jaipur Gifting">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
              Frontend Foundation & Design System
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Jaipur Gifting UI Library</h1>
            <p className="text-indigo-200 text-sm sm:text-base leading-relaxed">
              Complete, production-ready design system built with React 19, Tailwind CSS, Zustand state management, and Google Maps location services.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button onClick={() => setLocationModalOpen(true)} className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold">
                <MapPin className="h-4 w-4 mr-2" /> Open Google Maps Location Selector
              </Button>
              <Button variant="outline" onClick={() => addToast('Welcome to Jaipur Gifting UI System!', 'success')} className="border-indigo-400/40 text-white hover:bg-white/10">
                Trigger Toast Notification
              </Button>
            </div>
          </div>
        </div>

        {/* Section 1: Buttons */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Buttons & Icon Buttons</h2>
          <Card className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button isLoading>Loading State</Button>
              <IconButton icon={<Heart className="h-5 w-5 text-red-500" />} label="Wishlist" variant="outline" />
            </div>
          </Card>
        </div>

        {/* Section 2: Badges & Tags */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Badges & Tags</h2>
          <Card className="p-6">
            <div className="flex flex-wrap gap-3 items-center">
              <Badge variant="default">Default Badge</Badge>
              <Badge variant="success">Success / 10 Min Ready</Badge>
              <Badge variant="warning">Warning / Express</Badge>
              <Badge variant="danger">Danger / Out of Stock</Badge>
              <Badge variant="info">Info / Customisable</Badge>
            </div>
          </Card>
        </div>

        {/* Section 3: Inputs & Forms */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Inputs & Form Controls</h2>
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Recipient Name" placeholder="e.g. Priya Sharma" />
              <Input label="Search Query" placeholder="Search mithai, cakes..." icon={<Sparkles className="h-4 w-4 text-indigo-500" />} />
            </div>
          </Card>
        </div>

        {/* Section 4: Ecommerce Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Ecommerce Product & Category Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <ProductCard product={sampleProduct} />
            <CategoryCard category={sampleCategory} onClick={() => alert('Category clicked')} />
          </div>
        </div>

        {/* Section 5: Modals & Drawers */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Modals & Drawers</h2>
          <Card className="p-6">
            <div className="flex gap-4">
              <Button onClick={() => setIsModalOpen(true)}>Open Sample Modal</Button>
              <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>Open Sample Drawer</Button>
            </div>
          </Card>
        </div>

      </div>

      {/* Sample Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Sample Enterprise Modal">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This is a reusable modal component with backdrop blur, keyboard escape listener, and smooth entry animation.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
            <Button onClick={() => { setIsModalOpen(false); addToast('Action completed successfully!'); }}>Confirm</Button>
          </div>
        </div>
      </Modal>

      {/* Sample Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Sample Enterprise Drawer">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Slide-in drawer for cart, checkout, filters, or user profile management.
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-indigo-600">Active State Ready</p>
          </div>
        </div>
      </Drawer>
    </PublicLayout>
  );
}
