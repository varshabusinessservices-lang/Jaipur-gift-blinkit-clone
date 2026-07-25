import { apiClient } from '../../../lib/axios';

export const personalisationFormsService = {
  async listForms() {
    const { data } = await apiClient.get('/admin/personalisation-forms');
    return data.data;
  },

  async getForm(id: string, version?: number) {
    const { data } = await apiClient.get(`/admin/personalisation-forms/${id}`, {
      params: version !== undefined ? { version } : {},
    });
    return data.data;
  },

  async createForm(formData: any) {
    const { data } = await apiClient.post('/admin/personalisation-forms', formData);
    return data.data;
  },

  async updateForm(id: string, formData: any) {
    const { data } = await apiClient.put(`/admin/personalisation-forms/${id}`, formData);
    return data.data;
  },

  async deleteForm(id: string) {
    const { data } = await apiClient.delete(`/admin/personalisation-forms/${id}`);
    return data;
  },

  async duplicateForm(id: string) {
    const { data } = await apiClient.post(`/admin/personalisation-forms/${id}/duplicate`);
    return data.data;
  },

  async duplicateField(formId: string, fieldId: string) {
    const { data } = await apiClient.post(`/admin/personalisation-forms/${formId}/fields/${fieldId}/duplicate`);
    return data.data;
  },

  async reorderFields(formId: string, fieldIds: string[]) {
    const { data } = await apiClient.post(`/admin/personalisation-forms/${formId}/fields/reorder`, { fieldIds });
    return data.data;
  },

  async getGlobalSettings() {
    const { data } = await apiClient.get('/admin/personalisation-forms/global-settings');
    return data.data;
  },

  async updateGlobalSettings(settings: { requireWhatsAppForAllPersonalisedProducts: boolean }) {
    const { data } = await apiClient.put('/admin/personalisation-forms/global-settings', settings);
    return data.data;
  },

  async assignForm(formId: string, payload: { productId?: string; variationId?: string }) {
    const { data } = await apiClient.post(`/admin/personalisation-forms/${formId}/assign`, payload);
    return data.data;
  },

  async getAssignment(query: { productId?: string; variationId?: string }) {
    const { data } = await apiClient.get('/admin/personalisation-forms/assignments', { params: query });
    return data.data;
  },

  async removeAssignment(query: { productId?: string; variationId?: string }) {
    const { data } = await apiClient.delete('/admin/personalisation-forms/assignments', { params: query });
    return data;
  },

  async validateSubmission(formId: string, submissionData: any, version?: number) {
    const { data } = await apiClient.post(`/personalisation-forms/${formId}/validate`, { submissionData }, {
      params: version !== undefined ? { version } : {},
    });
    return data.data;
  },

  // Public retrieval (unauthenticated)
  async getFormPublic(idOrSlug: string, version?: number) {
    const { data } = await apiClient.get(`/personalisation-forms/${idOrSlug}`, {
      params: version !== undefined ? { version } : {},
    });
    return data.data;
  }
};
