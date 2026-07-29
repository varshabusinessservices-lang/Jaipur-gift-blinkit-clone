/// <reference types="vite/client" />

const rawMockVal = import.meta.env.VITE_ADMIN_USE_MOCK_API;
const isProd = import.meta.env.PROD || import.meta.env.MODE === 'production';

let useMockApi = false;

if (rawMockVal !== undefined && String(rawMockVal).toLowerCase() === 'true') {
  if (isProd) {
    throw new Error("CRITICAL FATAL CONFIG ERROR: VITE_ADMIN_USE_MOCK_API cannot be 'true' in production build!");
  }
  useMockApi = true;
}

function normalizeApiBaseUrl(url?: string): string {
  if (!url || url.includes('localhost')) {
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

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const resolvedApiBaseUrl = normalizeApiBaseUrl(rawApiBaseUrl);

export const config = {
  apiBaseUrl: resolvedApiBaseUrl,
  appName: import.meta.env.VITE_APP_NAME || "Jaipur Personalised Gifts Admin",
  appEnv: import.meta.env.VITE_APP_ENV || (isProd ? "production" : "development"),
  useMockApi,
  adminUseMockApi: useMockApi,
  currency: "INR",
  timezone: "Asia/Kolkata",
  isSingleStoreMode: true,
};

