import { apiClient as api } from '../../../lib/axios';

export const themeApi = {
  getTheme: async () => {
    const res = await api.get('/admin/appearance/theme');
    return res.data;
  },
  updateTheme: async (data: any) => {
    const res = await api.put('/admin/appearance/theme', data);
    return res.data;
  },
  publishTheme: async () => {
    const res = await api.post('/admin/appearance/theme/publish');
    return res.data;
  },
  getThemeVersions: async () => {
    const res = await api.get('/admin/appearance/theme/versions');
    return res.data;
  },
  getGlobalStyles: async () => {
    const res = await api.get('/admin/appearance/global-styles');
    return res.data;
  },
  updateGlobalStyles: async (data: any) => {
    const res = await api.put('/admin/appearance/global-styles', data);
    return res.data;
  },
  getHomepage: async () => {
    const res = await api.get('/admin/appearance/homepage');
    return res.data;
  },
  updateHomepage: async (data: any) => {
    const res = await api.put('/admin/appearance/homepage', data);
    return res.data;
  },
  addHomepageSection: async (data: any) => {
    const res = await api.post('/admin/appearance/homepage/sections', data);
    return res.data;
  },
  updateHomepageSection: async (id: string, data: any) => {
    const res = await api.put(`/admin/appearance/homepage/sections/${id}`, data);
    return res.data;
  },
  deleteHomepageSection: async (id: string) => {
    const res = await api.delete(`/admin/appearance/homepage/sections/${id}`);
    return res.data;
  },
  reorderHomepageSections: async (sectionIds: string[]) => {
    const res = await api.post('/admin/appearance/homepage/reorder', { sectionIds });
    return res.data;
  },
  getStorefrontTheme: async () => {
    const res = await api.get('/storefront/appearance/theme');
    return res.data;
  },
  getStorefrontHomepage: async () => {
    const res = await api.get('/storefront/appearance/homepage');
    return res.data;
  }
};
