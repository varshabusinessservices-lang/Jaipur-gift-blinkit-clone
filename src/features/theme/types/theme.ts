export interface ThemeMetadata {
  id: string;
  name: string;
  description?: string;
  version: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
    border: string;
    overlay: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: string;
    headingLineHeight: string;
    bodyLineHeight: string;
  };
  spacing: {
    pagePaddingX: string;
    sectionPaddingY: string;
    gapSm: string;
    gapMd: string;
    gapLg: string;
  };
  shapes: {
    radiusSm: string;
    radiusMd: string;
    radiusLg: string;
    radiusFull: string;
  };
  effects: {
    shadowSm: string;
    shadowMd: string;
    shadowLg: string;
  };
}

export interface ResponsiveDesignTokens {
  mobile: DesignTokens;
  tablet: Partial<DesignTokens>;
  desktop: Partial<DesignTokens>;
}

export interface BackgroundConfiguration {
  type: 'solid' | 'gradient' | 'image' | 'transparent' | 'inherit';
  color?: string;
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: string;
  imageUrl?: string;
  imagePosition?: string;
  imageSize?: 'cover' | 'contain' | 'auto';
  imageRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  attachment?: 'scroll' | 'fixed';
  overlayColor?: string;
  overlayOpacity?: number;
}

export interface HeaderBlock {
  id: string;
  type: 'logo' | 'search' | 'account' | 'wishlist' | 'cart' | 'navigation' | 'promoStrip' | 'spacer' | 'location';
  alignment?: 'left' | 'center' | 'right';
  width?: string;
  hiddenOnMobile?: boolean;
  hiddenOnDesktop?: boolean;
  settings?: Record<string, any>;
}

export interface HeaderConfiguration {
  sticky: boolean;
  height: string;
  background: BackgroundConfiguration;
  blocks: {
    top?: HeaderBlock[];
    main: HeaderBlock[];
    bottom?: HeaderBlock[];
  };
}

export interface ResponsiveHeaderConfiguration {
  mobile: HeaderConfiguration;
  tablet: Partial<HeaderConfiguration>;
  desktop: Partial<HeaderConfiguration>;
}

export interface FooterBlock {
  id: string;
  type: 'logo' | 'text' | 'links' | 'newsletter' | 'social' | 'contact' | 'customHTML';
  settings?: Record<string, any>;
}

export interface FooterConfiguration {
  layout: 'accordion' | 'columns-2' | 'columns-3' | 'columns-4' | 'columns-5' | 'minimal';
  background: BackgroundConfiguration;
  blocks: FooterBlock[];
}

export interface ResponsiveFooterConfiguration {
  mobile: FooterConfiguration;
  tablet: Partial<FooterConfiguration>;
  desktop: Partial<FooterConfiguration>;
}

export interface NavigationItem {
  id: string;
  label: string;
  url?: string;
  icon?: string;
  children?: NavigationItem[];
  megaMenu?: boolean;
}

export interface PageSectionConfiguration {
  id: string;
  type: string;
  enabled: boolean;
  order: number;
  title?: string;
  subtitle?: string;
  dataSource?: {
    type: 'static' | 'category' | 'collection' | 'custom';
    value?: string;
    limit?: number;
  };
  layout: {
    mobile: 'horizontal' | 'grid-1' | 'grid-2' | 'carousel';
    desktop: 'grid-3' | 'grid-4' | 'grid-5' | 'carousel' | 'masonry';
  };
  style: {
    background: BackgroundConfiguration;
    paddingTop?: string;
    paddingBottom?: string;
    maxWidth?: string;
    cardPresetId?: string;
  };
  visibility?: {
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
    startDate?: string;
    endDate?: string;
  };
}

export interface PageConfiguration {
  id: string;
  name: string;
  background: BackgroundConfiguration;
  sections: PageSectionConfiguration[];
}

export interface CampaignTheme {
  id: string;
  name: string;
  active: boolean;
  startDate: string;
  endDate: string;
  priority: number;
  overrides: {
    global?: Partial<ResponsiveDesignTokens>;
    home?: PageConfiguration;
    header?: Partial<ResponsiveHeaderConfiguration>;
  };
}

export interface ThemeConfiguration {
  metadata: ThemeMetadata;
  global: ResponsiveDesignTokens;
  header: ResponsiveHeaderConfiguration;
  footer: ResponsiveFooterConfiguration;
  navigation: NavigationItem[];
  pages: {
    home: PageConfiguration;
    category: PageConfiguration;
    productCustomized: PageConfiguration;
    productStandard: PageConfiguration;
    search: PageConfiguration;
    cart: PageConfiguration;
    checkout: PageConfiguration;
  };
  campaigns: CampaignTheme[];
}
