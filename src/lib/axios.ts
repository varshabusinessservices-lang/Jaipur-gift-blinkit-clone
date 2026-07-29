
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { config } from '../config/env';
import { useAuthStore } from '../store/authStore';

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
});

if (config.useMockApi) {
  const mock = new MockAdapter(apiClient, { delayResponse: 500 });
  
  // Wallet
  mock.onGet(/\/admin\/wallet\/metrics/).reply(200, {
    success: true,
    data: {
      totalWalletLiability: "0.00",
      selfLoadedBalance: "0.00",
      rewardBalance: "0.00",
      referralBalance: "0.00",
      promotionalBalance: "0.00",
      refundBalance: "0.00",
      todayCredits: "0.00",
      todayDebits: "0.00",
      activeReservations: 0,
      pendingTopups: 0
    }
  });
  mock.onGet(/\/admin\/wallet\/.*/).reply(200, { success: true, data: { accounts: [], transactions: [], ledger: [], lots: [], reservations: [], topups: [], adjustments: [], refunds: [], expiring: [], reconciliation: [] } });

  // Rewards
  mock.onGet(/\/admin\/rewards\/metrics/).reply(200, {
    success: true,
    data: {
      estimatedCount: 0,
      pendingCount: 0,
      coolingCount: 0,
      claimableCount: 0,
      convertedCount: 0,
      expiredCount: 0,
      reversedCount: 0,
      claimableValue: "0.00",
      convertedValue: "0.00",
      totalIssued: "0.00",
      totalRedeemed: "0.00",
      activeRewards: 0
    }
  });
  mock.onGet(/\/admin\/rewards\/.*/).reply(200, { success: true, data: { transactions: [], conversions: [], rewards: [], lots: [], reversals: [], notifications: [], cases: [], reconciliation: [], settings: [] } });

  // Referrals
  mock.onGet(/\/admin\/referrals\/summary/).reply(200, {
    success: true,
    data: {
      totalCodes: 0,
      registeredCount: 0,
      pendingQualificationCount: 0,
      coolingCount: 0,
      qualifiedCount: 0,
      rewardedCount: 0,
      fraudHoldCount: 0,
      manualReviewCount: 0,
      currentMonthCost: "0.00"
    }
  });
  mock.onGet(/\/admin\/referrals\/.*/).reply(200, { success: true, data: { relationships: [], reviewCases: [], codes: [], credits: [], qualifications: [], fraud: [], recovery: [], reconciliation: [], notifications: [] } });
  
  // Pass through all other requests
  mock.onAny().passThrough();
}

apiClient.interceptors.request.use(
  (reqConfig) => {
    if (config.useMockApi) return reqConfig;
    const token = useAuthStore.getState().accessToken;
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        reqConfig.headers['x-refresh-token'] = refreshToken;
      }
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: any[] = [];
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(`${config.apiBaseUrl}/auth/refresh-token`, { refreshToken });
        if (data.success && data.data) {
          useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken);
          processQueue(null, data.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return axios(originalRequest);
        } else {
           throw new Error('Refresh failed');
        }
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
