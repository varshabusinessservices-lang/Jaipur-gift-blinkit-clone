export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductVariation {
  id: string;
  name: string; // e.g. "Gold / 18 inch" or "Large / Black"
  price: number;
  originalPrice?: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  galleryImages?: string[];
  deliveryTime: string; // e.g. "10 mins"
  category: string;
  isPersonalisable: boolean;
  productType: 'single' | 'variation';
  variations?: ProductVariation[];
  reviews: ProductReview[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  itemCount: number;
  desktopBannerUrl?: string;
  mobileBannerUrl?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkCategory: string;
  badgeText?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariation?: ProductVariation;
  personalisation?: {
    recipientName?: string;
    giftMessage?: string;
    uploadedImageUrl?: string;
  };
}

export interface UserAddress {
  id: string;
  title: string;
  fullAddress: string;
  landmark?: string;
  pincode: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  walletBalance: number;
  addresses: UserAddress[];
}

