import { create } from 'zustand';
import { Product, Category, Banner, CartItem, UserAddress, ProductVariation, UserProfile, PersonalisationTemplate } from '../types';
import { categoriesData, bannersData, generateProducts } from '../data/mockData';
import { defaultPersonalisationTemplates } from '../data/personalisationTemplates';

interface ShopState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  categories: Category[];
  banners: Banner[];
  products: Product[];
  templates: PersonalisationTemplate[];

  selectedCategory: string | null;
  setSelectedCategory: (categorySlug: string | null) => void;

  productTypeFilter: 'all' | 'single' | 'variation';
  setProductTypeFilter: (type: 'all' | 'single' | 'variation') => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariation?: ProductVariation, personalisationData?: Record<string, any>, giftMessage?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;

  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  recentlyViewed: Product[];
  addProductView: (product: Product) => void;

  currentUser: UserProfile | null;
  loginWithPhone: (phone: string, name?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addAddress: (address: Omit<UserAddress, 'id'>) => void;
  removeAddress: (id: string) => void;

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

  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;

  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const allGeneratedProducts = generateProducts();

// LocalStorage helpers
const getStoredTheme = (): 'light' | 'dark' | 'system' => {
  return (localStorage.getItem('jaipur_gifting_theme') as any) || 'light';
};

const getStoredCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem('jaipur_gifting_cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getStoredWishlist = (): Product[] => {
  try {
    const stored = localStorage.getItem('jaipur_gifting_wishlist');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getStoredRecentlyViewed = (): Product[] => {
  try {
    const stored = localStorage.getItem('jaipur_gifting_recent');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getStoredUser = (): UserProfile | null => {
  try {
    const stored = localStorage.getItem('jaipur_gifting_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useShopStore = create<ShopState>((set, get) => {
  const initialTheme = getStoredTheme();
  if (typeof document !== 'undefined') {
    if (initialTheme === 'dark' || (initialTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return {
    theme: initialTheme,
    setTheme: (theme) => {
      localStorage.setItem('jaipur_gifting_theme', theme);
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ theme });
    },

    categories: categoriesData,
    banners: bannersData,
    products: allGeneratedProducts,
    templates: defaultPersonalisationTemplates,

    selectedCategory: null,
    setSelectedCategory: (categorySlug) => set({ selectedCategory: categorySlug }),

    productTypeFilter: 'all',
    setProductTypeFilter: (type) => set({ productTypeFilter: type }),

    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),

    cart: getStoredCart(),
    addToCart: (product, quantity = 1, selectedVariation, personalisationData, giftMessage) => {
      const cart = get().cart;
      const variationId = selectedVariation ? selectedVariation.id : 'base';
      const pHash = JSON.stringify(personalisationData || {});
      
      const existingIndex = cart.findIndex(
        item => item.product.id === product.id && 
                (item.selectedVariation?.id || 'base') === variationId &&
                JSON.stringify(item.personalisationData || {}) === pHash
      );

      let updatedCart;
      if (existingIndex > -1) {
        updatedCart = [...cart];
        updatedCart[existingIndex].quantity += quantity;
        if (giftMessage) updatedCart[existingIndex].giftMessage = giftMessage;
      } else {
        updatedCart = [...cart, { product, quantity, selectedVariation, personalisationData, giftMessage }];
      }

      localStorage.setItem('jaipur_gifting_cart', JSON.stringify(updatedCart));
      set({ cart: updatedCart });
      get().addToast(`Added ${product.name} to cart!`, 'success');
    },

    removeFromCart: (cartItemId) => {
      const updated = get().cart.filter((item, idx) => {
        const id = `${item.product.id}-${item.selectedVariation?.id || 'base'}-${idx}`;
        return id !== cartItemId;
      });
      localStorage.setItem('jaipur_gifting_cart', JSON.stringify(updated));
      set({ cart: updated });
      get().addToast('Item removed from cart', 'info');
    },

    updateQuantity: (cartItemId, quantity) => {
      if (quantity <= 0) {
        get().removeFromCart(cartItemId);
        return;
      }
      const updated = get().cart.map((item, idx) => {
        const id = `${item.product.id}-${item.selectedVariation?.id || 'base'}-${idx}`;
        if (id === cartItemId) {
          return { ...item, quantity };
        }
        return item;
      });
      localStorage.setItem('jaipur_gifting_cart', JSON.stringify(updated));
      set({ cart: updated });
    },

    clearCart: () => {
      localStorage.removeItem('jaipur_gifting_cart');
      set({ cart: [] });
    },

    wishlist: getStoredWishlist(),
    toggleWishlist: (product) => {
      const wishlist = get().wishlist;
      const exists = wishlist.some(p => p.id === product.id);
      let updated;
      if (exists) {
        updated = wishlist.filter(p => p.id !== product.id);
        get().addToast('Removed from wishlist', 'info');
      } else {
        updated = [...wishlist, product];
        get().addToast('Added to wishlist!', 'success');
      }
      localStorage.setItem('jaipur_gifting_wishlist', JSON.stringify(updated));
      set({ wishlist: updated });
    },
    isInWishlist: (productId) => get().wishlist.some(p => p.id === productId),

    recentlyViewed: getStoredRecentlyViewed(),
    addProductView: (product) => {
      const current = get().recentlyViewed.filter(p => p.id !== product.id);
      const updated = [product, ...current].slice(0, 10);
      localStorage.setItem('jaipur_gifting_recent', JSON.stringify(updated));
      set({ recentlyViewed: updated });
    },

    currentUser: getStoredUser(),
    loginWithPhone: (phone, name = 'Customer') => {
      const user: UserProfile = {
        id: `usr-${Date.now()}`,
        name,
        phone,
        email: `${phone}@jaipurgifting.com`,
        walletBalance: 250,
        addresses: [
          {
            id: 'addr-1',
            title: 'Home',
            fullAddress: 'C-12, Malviya Nagar, Jaipur, Rajasthan',
            landmark: 'Near World Trade Park',
            pincode: '302017',
            isDefault: true,
            lat: 26.8549,
            lng: 75.8236
          }
        ],
        orders: [
          {
            id: 'ord-101',
            orderNumber: 'JPR-2026-9481',
            createdAt: '2 days ago',
            status: 'DELIVERED',
            totalAmount: 1249,
            deliveryAddress: {
              id: 'addr-1',
              title: 'Home',
              fullAddress: 'C-12, Malviya Nagar, Jaipur, Rajasthan',
              pincode: '302017',
              isDefault: true
            },
            items: [
              {
                id: 'oi-1',
                productName: 'Customised Photo Lamp',
                productImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80',
                price: 1249,
                quantity: 1,
                personalisationData: { recipientName: 'Priya' }
              }
            ],
            deliveryTime: '10 mins'
          }
        ]
      };
      localStorage.setItem('jaipur_gifting_user', JSON.stringify(user));
      set({ currentUser: user, isLoginModalOpen: false });
      get().addToast('Successfully logged in!', 'success');
    },

    logout: () => {
      localStorage.removeItem('jaipur_gifting_user');
      set({ currentUser: null });
      get().addToast('Logged out successfully', 'info');
    },

    updateProfile: (data) => {
      const curr = get().currentUser;
      if (!curr) return;
      const updated = { ...curr, ...data };
      localStorage.setItem('jaipur_gifting_user', JSON.stringify(updated));
      set({ currentUser: updated });
      get().addToast('Profile updated', 'success');
    },

    addAddress: (addressData) => {
      const curr = get().currentUser;
      if (!curr) return;
      const newAddr: UserAddress = { ...addressData, id: `addr-${Date.now()}` };
      const addresses = addressData.isDefault ? curr.addresses.map(a => ({ ...a, isDefault: false })) : [...curr.addresses];
      addresses.push(newAddr);
      const updated = { ...curr, addresses };
      localStorage.setItem('jaipur_gifting_user', JSON.stringify(updated));
      set({ currentUser: updated });
      get().addToast('Address added successfully', 'success');
    },

    removeAddress: (id) => {
      const curr = get().currentUser;
      if (!curr) return;
      const addresses = curr.addresses.filter(a => a.id !== id);
      const updated = { ...curr, addresses };
      localStorage.setItem('jaipur_gifting_user', JSON.stringify(updated));
      set({ currentUser: updated });
      get().addToast('Address removed', 'info');
    },

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

    isLoginModalOpen: false,
    setLoginModalOpen: (open) => set({ isLoginModalOpen: open }),

    toasts: [],
    addToast: (message, type = 'success') => {
      const id = Math.random().toString(36).substring(2, 9);
      set({ toasts: [...get().toasts, { id, message, type }] });
      setTimeout(() => {
        get().removeToast(id);
      }, 4000);
    },
    removeToast: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) })
  };
});
