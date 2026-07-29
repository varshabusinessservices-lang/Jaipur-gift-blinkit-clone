export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductVariation {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

export interface PersonalisationField {
  id: string;
  label: string;
  type: 'image' | 'text' | 'textarea' | 'date' | 'number' | 'dropdown' | 'checkbox' | 'radio';
  required: boolean;
  placeholder?: string;
  options?: string[]; // for dropdown/radio
  helpText?: string;
}

export interface PersonalisationTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  templateType: 
    | 'single_photo_name'
    | 'photo_name_message'
    | 'couple_anniversary'
    | 'birthday'
    | 'baby_details'
    | 'family_collage'
    | 'multi_photo_collage'
    | 'tshirt_custom'
    | 'mug_custom'
    | 'fully_custom';
  isActive: boolean;
  fields: PersonalisationField[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  galleryImages?: string[];
  deliveryTime: string;
  category: string;
  isPersonalisable: boolean;
  personalisationTemplateCode?: string;
  productType: 'single' | 'variation';
  variations?: ProductVariation[];
  reviews: ProductReview[];
  bundleProductIds?: string[];
  stock?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isSameDayDelivery?: boolean;
  isNewArrival?: boolean;
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
  mobileImageUrl?: string;
  linkCategory: string;
  badgeText?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariation?: ProductVariation;
  personalisationData?: Record<string, any>;
  giftMessage?: string;
}

export interface UserAddress {
  id: string;
  title: string;
  fullAddress: string;
  landmark?: string;
  pincode: string;
  phone?: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

export interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  variationName?: string;
  personalisationData?: Record<string, any>;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'PLACED' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  deliveryAddress: UserAddress;
  items: OrderItem[];
  deliveryTime: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  walletBalance: number;
  addresses: UserAddress[];
  orders: Order[];
}
