import { create } from 'zustand';
import { themeApi } from '../services/themeApi';

interface ThemeState {
  activeTheme: any;
  draftTheme: any;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  error: string | null;
  previewMode: boolean;
  
  fetchAdminTheme: () => Promise<void>;
  fetchStorefrontTheme: () => Promise<void>;
  
  updateGlobalStyles: (styles: any) => Promise<void>;
  updateHomepageSection: (id: string, data: any) => Promise<void>;
  addHomepageSection: (data: any) => Promise<void>;
  deleteHomepageSection: (id: string) => Promise<void>;
  reorderPageSections: (sectionIds: string[]) => Promise<void>;
  
  publishDraft: () => Promise<void>;
  resetDraft: () => Promise<void>;
  togglePreviewMode: () => void;
  
  // Local optimisic updates
  setDraftTheme: (theme: any) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  activeTheme: null,
  draftTheme: null,
  hasUnsavedChanges: false,
  isLoading: false,
  error: null,
  previewMode: false,

  setDraftTheme: (theme) => set({ draftTheme: theme, hasUnsavedChanges: true }),
  togglePreviewMode: () => set((state) => ({ previewMode: !state.previewMode })),

  fetchAdminTheme: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await themeApi.getTheme();
      set({ draftTheme: data.data, isLoading: false, hasUnsavedChanges: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchStorefrontTheme: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await themeApi.getStorefrontTheme();
      set({ activeTheme: data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateGlobalStyles: async (styles) => {
    try {
      await themeApi.updateGlobalStyles(styles);
      await get().fetchAdminTheme();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateHomepageSection: async (id, data) => {
    try {
      await themeApi.updateHomepageSection(id, data);
      await get().fetchAdminTheme();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addHomepageSection: async (data) => {
    try {
      await themeApi.addHomepageSection(data);
      await get().fetchAdminTheme();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteHomepageSection: async (id) => {
    try {
      await themeApi.deleteHomepageSection(id);
      await get().fetchAdminTheme();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  reorderPageSections: async (sectionIds) => {
    try {
      await themeApi.reorderHomepageSections(sectionIds);
      await get().fetchAdminTheme();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  publishDraft: async () => {
    set({ isLoading: true });
    try {
      await themeApi.publishTheme();
      await get().fetchAdminTheme();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  resetDraft: async () => {
    // Actually we can just refetch admin theme which is the draft
    await get().fetchAdminTheme();
  }
}));
