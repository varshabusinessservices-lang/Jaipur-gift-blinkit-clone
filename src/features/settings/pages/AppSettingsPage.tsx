import React from 'react';
import { SettingsForm, SettingsField } from '../components/SettingsForm';

export function AppSettingsPage() {
  const fields: SettingsField[] = [
    { key: 'customerAppName', label: 'Customer App Name', type: 'text' },
    { key: 'riderAppName', label: 'Rider App Name', type: 'text' },
    { key: 'androidAppId', label: 'Android Application ID', type: 'text', placeholder: 'com.jaipurgifting.customer' },
    { key: 'customerPwaEnabled', label: 'Customer PWA Enabled', type: 'toggle' },
    { key: 'riderPwaEnabled', label: 'Rider PWA Enabled', type: 'toggle' },
    { key: 'customerAppLogo', label: 'Customer App Logo', type: 'image', description: 'Recommended 512x512px PNG' },
    { key: 'riderAppLogo', label: 'Rider App Logo', type: 'image', description: 'Recommended 512x512px PNG' },
    { key: 'customerSplash', label: 'Customer Splash Screen', type: 'image', description: 'Recommended 1280x1280px' },
    { key: 'riderSplash', label: 'Rider Splash Screen', type: 'image', description: 'Recommended 1280x1280px' },
    { key: 'appIcon', label: 'App Icon', type: 'image', description: 'App launcher icon' },
    { key: 'notificationIcon', label: 'Notification Icon', type: 'image', description: 'Monochrome push notification icon' },
    { key: 'themeColors', label: 'Theme Colours (JSON)', type: 'textarea' },
    { key: 'appVersion', label: 'App Version', type: 'text' },
    { key: 'minSupportedVersion', label: 'Minimum Supported Version', type: 'text' },
    { key: 'forceUpdateEnabled', label: 'Force Update Foundation', type: 'toggle' },
    { key: 'maintenanceMessage', label: 'Maintenance Message', type: 'textarea' },
    { key: 'customerAppUrl', label: 'Customer App URL', type: 'text' },
    { key: 'riderAppUrl', label: 'Rider App URL', type: 'text' },
    { key: 'deepLinkBaseUrl', label: 'Deep Linking Base URL', type: 'text' },
    { key: 'pushEnabledStatus', label: 'Push Enabled Status', type: 'status', readOnly: true },
    { key: 'playStoreUrl', label: 'Play Store URL', type: 'text' },
    { key: 'appStoreUrl', label: 'App Store URL', type: 'text' }
  ];

  return (
    <SettingsForm 
      title="App Settings" 
      description="Configure mobile application endpoints, branding, and versions."
      namespace="app"
      fields={fields}
    />
  );
}
