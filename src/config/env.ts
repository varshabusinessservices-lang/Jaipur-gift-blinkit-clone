/// <reference types="vite/client" />
const useMockApi = String(import.meta.env.VITE_ADMIN_USE_MOCK_API).toLowerCase() === 'true';

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isLocalhostUrl = rawApiBaseUrl && rawApiBaseUrl.includes('localhost');
const resolvedApiBaseUrl = (rawApiBaseUrl && !isLocalhostUrl) 
  ? rawApiBaseUrl 
  : "/api/v1";

export const config = {
  apiBaseUrl: resolvedApiBaseUrl,
  appName: import.meta.env.VITE_APP_NAME || "Jaipur Personalised Gifts Admin",
  appEnv: import.meta.env.VITE_APP_ENV || "development",
  useMockApi,
  adminUseMockApi: useMockApi,
  currency: "INR",
  timezone: "Asia/Kolkata",
  isSingleStoreMode: true,
};
