/// <reference types="vite/client" />
const useMockApi = String(import.meta.env.VITE_ADMIN_USE_MOCK_API).toLowerCase() === 'true';

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  appName: import.meta.env.VITE_APP_NAME || "Jaipur Personalised Gifts Admin",
  appEnv: import.meta.env.VITE_APP_ENV || "development",
  useMockApi,
  adminUseMockApi: useMockApi,
  currency: "INR",
  timezone: "Asia/Kolkata",
  isSingleStoreMode: true,
};
