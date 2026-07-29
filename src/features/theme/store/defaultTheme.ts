import { ThemeConfiguration } from '../types/theme';

export const defaultTheme: ThemeConfiguration = {
  metadata: {
    id: 'theme-default-001',
    name: 'Jaipur Gifting Default',
    version: '1.0.0',
    author: 'Admin',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  global: {
    mobile: {
      colors: {
        primary: '#4f46e5',
        secondary: '#10b981',
        accent: '#f59e0b',
        background: '#ffffff',
        surface: '#f8fafc',
        textPrimary: '#0f172a',
        textSecondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        border: '#e2e8f0',
        overlay: 'rgba(0,0,0,0.5)',
      },
      typography: {
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif',
        baseFontSize: '16px',
        headingLineHeight: '1.2',
        bodyLineHeight: '1.5',
      },
      spacing: {
        pagePaddingX: '1rem',
        sectionPaddingY: '2rem',
        gapSm: '0.5rem',
        gapMd: '1rem',
        gapLg: '1.5rem',
      },
      shapes: {
        radiusSm: '0.25rem',
        radiusMd: '0.5rem',
        radiusLg: '1rem',
        radiusFull: '9999px',
      },
      effects: {
        shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
    tablet: {},
    desktop: {
      spacing: {
        pagePaddingX: '2rem',
        sectionPaddingY: '4rem',
        gapSm: '0.75rem',
        gapMd: '1.5rem',
        gapLg: '2rem',
      }
    }
  },
  header: {
    mobile: {
      sticky: true,
      height: '64px',
      background: { type: 'solid', color: '#ffffff' },
      blocks: {
        main: [
          { id: 'h-logo', type: 'logo' },
          { id: 'h-search', type: 'search' },
          { id: 'h-cart', type: 'cart' },
        ]
      }
    },
    tablet: {},
    desktop: {
      sticky: true,
      height: '84px',
      background: { type: 'solid', color: '#ffffff' },
      blocks: {
        main: [
          { id: 'h-logo-d', type: 'logo', alignment: 'left' },
          { id: 'h-search-d', type: 'search', alignment: 'center' },
          { id: 'h-nav-d', type: 'navigation', alignment: 'center' },
          { id: 'h-wishlist-d', type: 'wishlist', alignment: 'right' },
          { id: 'h-account-d', type: 'account', alignment: 'right' },
          { id: 'h-cart-d', type: 'cart', alignment: 'right' },
        ]
      }
    }
  },
  footer: {
    mobile: {
      layout: 'accordion',
      background: { type: 'solid', color: '#0f172a' },
      blocks: [
        { id: 'f-logo', type: 'logo' },
        { id: 'f-text', type: 'text', settings: { text: 'Jaipur Gifting Enterprise - Your premier gifting destination.' } },
        { id: 'f-links-1', type: 'links', settings: { title: 'Quick Links' } }
      ]
    },
    tablet: {},
    desktop: {
      layout: 'columns-4',
      background: { type: 'solid', color: '#0f172a' },
      blocks: [
        { id: 'f-logo-d', type: 'logo' },
        { id: 'f-text-d', type: 'text', settings: { text: 'Jaipur Gifting Enterprise - Your premier gifting destination.' } },
        { id: 'f-links-1-d', type: 'links', settings: { title: 'Quick Links' } },
        { id: 'f-links-2-d', type: 'links', settings: { title: 'Support' } }
      ]
    }
  },
  navigation: [],
  pages: {
    home: {
      id: 'home',
      name: 'Home Page',
      background: { type: 'inherit' },
      sections: [
        {
          id: 'sec-quick-filters',
          type: 'QuickFilterRow',
          enabled: true,
          order: 1,
          layout: { mobile: 'horizontal', desktop: 'horizontal' as any },
          style: { background: { type: 'inherit' } },
          visibility: { hideOnDesktop: true }
        },
        {
          id: 'sec-category-slider',
          type: 'CategorySlider',
          enabled: true,
          order: 2,
          layout: { mobile: 'carousel', desktop: 'grid-6' as any },
          style: { background: { type: 'inherit' } }
        },
        {
          id: 'sec-banner-slider',
          type: 'BannerSlider',
          enabled: true,
          order: 3,
          layout: { mobile: 'carousel', desktop: 'carousel' as any },
          style: { background: { type: 'inherit' } }
        },
        {
          id: 'sec-featured',
          type: 'FeaturedProducts',
          enabled: true,
          order: 4,
          layout: { mobile: 'grid-2', desktop: 'grid-4' as any },
          style: { background: { type: 'inherit' } }
        }
      ]
    },
    category: {
      id: 'category',
      name: 'Category Page',
      background: { type: 'inherit' },
      sections: []
    },
    productCustomized: {
      id: 'product-customized',
      name: 'Product Page (Customized)',
      background: { type: 'inherit' },
      sections: []
    },
    productStandard: {
      id: 'product-standard',
      name: 'Product Page (Standard)',
      background: { type: 'inherit' },
      sections: [
        {
          id: 'prod-gallery',
          type: 'ProductGallery',
          enabled: true,
          order: 1,
          layout: { mobile: 'horizontal', desktop: 'grid-1' as any },
          style: { background: { type: 'inherit' } }
        },
        {
          id: 'prod-info',
          type: 'ProductInfo',
          enabled: true,
          order: 2,
          layout: { mobile: 'grid-1', desktop: 'grid-1' as any },
          style: { background: { type: 'inherit' } }
        },
        {
          id: 'prod-variants',
          type: 'VariantSelector',
          enabled: true,
          order: 3,
          layout: { mobile: 'grid-2', desktop: 'grid-2' as any },
          style: { background: { type: 'inherit' } }
        },
        {
          id: 'prod-delivery',
          type: 'DeliveryOptions',
          enabled: true,
          order: 4,
          layout: { mobile: 'grid-1', desktop: 'grid-1' as any },
          style: { background: { type: 'inherit' } }
        },
        {
          id: 'prod-description',
          type: 'ProductDescription',
          enabled: true,
          order: 5,
          layout: { mobile: 'grid-1', desktop: 'grid-1' as any },
          style: { background: { type: 'inherit' } }
        },
        {
          id: 'prod-reviews',
          type: 'Reviews',
          enabled: true,
          order: 6,
          layout: { mobile: 'grid-1', desktop: 'grid-1' as any },
          style: { background: { type: 'inherit' } }
        },
        {
          id: 'prod-related',
          type: 'RelatedProducts',
          enabled: true,
          order: 7,
          layout: { mobile: 'grid-2', desktop: 'grid-4' as any },
          style: { background: { type: 'inherit' } }
        }
      ]
    },
    search: {
      id: 'search',
      name: 'Search Page',
      background: { type: 'inherit' },
      sections: []
    },
    cart: {
      id: 'cart',
      name: 'Cart Page',
      background: { type: 'inherit' },
      sections: []
    },
    checkout: {
      id: 'checkout',
      name: 'Checkout Page',
      background: { type: 'inherit' },
      sections: []
    }
  },
  campaigns: []
};
