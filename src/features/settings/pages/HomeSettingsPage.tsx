import React from 'react';
import { SettingsForm, SettingsField } from '../components/SettingsForm';

export function HomeSettingsPage() {
  const fields: SettingsField[] = [
    { key: 'homePageTitle', label: 'Home Page Title', type: 'text' },
    { key: 'heroBanner', label: 'Hero Banner Settings (JSON)', type: 'textarea' },
    { key: 'mobileHeroBanner', label: 'Mobile Hero Banner Settings (JSON)', type: 'textarea' },
    { key: 'searchPlaceholder', label: 'Search Placeholder Text', type: 'text', placeholder: 'Search for personalized gifts...' },
    { key: 'categorySection', label: 'Category Section Enabled', type: 'toggle' },
    { key: 'featuredProductSection', label: 'Featured Product Section Enabled', type: 'toggle' },
    { key: 'sameDaySection', label: 'Same-Day Section Enabled', type: 'toggle' },
    { key: 'occasionSection', label: 'Occasion Section Enabled', type: 'toggle' },
    { key: 'bestSellers', label: 'Best Sellers Section Enabled', type: 'toggle' },
    { key: 'recentlyViewed', label: 'Recently Viewed Section Enabled', type: 'toggle' },
    { key: 'reorderSection', label: 'Reorder Section Enabled', type: 'toggle' },
    { key: 'appDownloadSection', label: 'App Download Section Enabled', type: 'toggle' },
    { key: 'featureSection', label: 'Feature Section Enabled', type: 'toggle' },
    { key: 'testimonials', label: 'Testimonials Foundation Enabled', type: 'toggle' },
    { key: 'instagramSection', label: 'Instagram Section Foundation Enabled', type: 'toggle' },
    { key: 'sectionVisibility', label: 'Section Visibility (JSON)', type: 'textarea' },
    { key: 'sectionOrder', label: 'Section Order (JSON array)', type: 'textarea' },
    { key: 'itemLimitPerSection', label: 'Item Limit per Section', type: 'number' }
  ];

  return (
    <SettingsForm 
      title="Home General Settings" 
      description="Manage the homepage layout, banners, and visible sections."
      namespace="home"
      fields={fields}
    />
  );
}
