import { create } from 'zustand';
import { Product, Category, Banner, CartItem, UserAddress, ProductVariation } from '../types';
import { categoriesData, bannersData, generateProducts } from '../data/mockData';

interface ShopState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  categories: Category[];
  banners: Banner[];
  products: Product[];
  
  selectedCategory: string | null;
  setSelectedCategory: (categorySlug: string | null) => void;

  productTypeFilter: 'all' | 'single' | 'variation';
  setProductTypeFilter: (type: 'all' | 'single' | 'variation') => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  activeProductModal: Product | null;
  setActiveProductModal: (product: Product | null) => void;

  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariation?: ProductVariation, personalisation?: CartItem['personalisation']) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  currentLocation: {
    address: string;
    pincode: string;
    lat: number;
    lng: number;
  };
  setLocation: (loc: { address: string; pincode: string; lat: number; lng: number }) => void;

  isLocationModalOpen: boolean;
  setLocationModalOpen: (open: boolean) => void;

  isCartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;

  isWishlistDrawerOpen: boolean;
  setWishlistDrawerOpen: (open: boolean) => void;

  isProfileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;

  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const allGeneratedProducts = generateProducts();

export const useShopStore = create<ShopState>((set, get) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),

  categories: categoriesData,
  banners: bannersData,
  products: allGeneratedProducts,

  selectedCategory: null,
  setSelectedCategory: (categorySlug) => set({ selectedCategory: categorySlug }),

  productTypeFilter: 'all',
  setProductTypeFilter: (type) => set({ productTypeFilter: type }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  activeProductModal: null,
  setActiveProductModal: (product) => set({ activeProductModal: product }),

  cart: [
    {
      product: allGeneratedProducts[0],
      quantity: 1,
      personalisation: { recipientName: 'Priya', giftMessage: 'Happy Birthday!' }
    }
  ],
  addToCart: (product, quantity = 1, selectedVariation, personalisation) => {
    const cart = get().cart;
    const variationId = selectedVariation ? selectedVariation.id : 'default';
    const existingIndex = cart.findIndex(item => item.product.id === product.id && (item.selectedVariation?.id === variationId));
    
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      if (personalisation) updated[existingIndex].personalisation = personalisation;
      set({ cart: updated });
    } else {
      set({ cart: [...cart, { product, quantity, selectedVariation, personalisation }] });
    }
    get().addToast(`Added ${product.name} to cart!`, 'success');
  },
  removeFromCart: (cartItemId) => {
    set({ cart: get().cart.filter((item) => `${item.product.id}-${item.selectedVariation?.id || 'base'}` !== cartItemId) });
    get().addToast('Item removed from cart', 'info');
  },
  updateQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(cartItemId);
      return;
    }
    set({
      cart: get().cart.map((item, idx) => {
        const id = `${item.product.id}-${item.selectedVariation?.id || 'base'}`;
        if (id === cartItemId) {
          return { ...item, quantity };
        }
        return item;
      })
    });
  },
  clearCart: () => set({ cart: [] }),

  wishlist: [],
  toggleWishlist: (product) => {
    const wishlist = get().wishlist;
    const exists = wishlist.some(p => p.id === product.id);
    if (exists) {
      set({ wishlist: wishlist.filter(p => p.id !== product.id) });
      get().addToast(`Removed from wishlist`, 'info');
    } else {
      set({ wishlist: [...wishlist, product] });
      get().addToast(`Added to wishlist!`, 'success');
    }
  },
  isInWishlist: (productId) => get().wishlist.some(p => p.id === productId),

  currentLocation: {
    address: 'C-12, Malviya Nagar, Jaipur, Rajasthan',
    pincode: '302017',
    lat: 26.8549,
    lng: 75.8236
  },
  setLocation: (loc) => set({ currentLocation: loc }),

  isLocationModalOpen: false,
  setLocationModalOpen: (open) => set({ isLocationModalOpen: open }),

  isCartDrawerOpen: false,
  setCartDrawerOpen: (open) => set({ isCartDrawerOpen: open }),

  isWishlistDrawerOpen: false,
  setWishlistDrawerOpen: (open) => set({ isWishlistDrawerOpen: open }),

  isProfileModalOpen: false,
  setProfileModalOpen: (open) => set({ isProfileModalOpen: open }),

  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) })
}));

function itemKey(item: CartItem, idx: number) {
  return `${item.product.id}-${item.selectedVariation?.id || 'base'}`;
}
