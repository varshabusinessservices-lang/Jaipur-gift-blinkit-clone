/// <reference types="vite/client" />

const isProd = import.meta.env.PROD || import.meta.env.MODE === 'production';

function normalizeApiBaseUrl(url?: string): string {
  if (!url) {
    return '/api/v1';
  }
  const trimmed = url.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/api/v1')) {
    return trimmed;
  }
  if (trimmed.endsWith('/api')) {
    return `${trimmed}/v1`;
  }
  return `${trimmed}/api/v1`;
}

const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
const resolvedApiBaseUrl = normalizeApiBaseUrl(rawApiUrl);

export const config = {
  apiBaseUrl: resolvedApiBaseUrl,
  appName: import.meta.env.VITE_APP_NAME || "Jaipur Personalised Gifts Admin",
  appEnv: import.meta.env.VITE_APP_ENV || (isProd ? "production" : "development"),
  useMockApi: false,
  adminUseMockApi: false,
  currency: "INR",
  timezone: "Asia/Kolkata",
  isSingleStoreMode: true,
};


