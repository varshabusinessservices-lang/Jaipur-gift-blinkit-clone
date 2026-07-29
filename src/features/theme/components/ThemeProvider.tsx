import React, { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTheme, draftTheme, previewMode, fetchStorefrontTheme, isLoading } = useThemeStore();
  const theme = previewMode ? draftTheme : activeTheme;

  useEffect(() => {
    fetchStorefrontTheme();
  }, [fetchStorefrontTheme]);

  useEffect(() => {
    if (!theme) return;

    // Inject CSS variables based on theme
    const root = document.documentElement;
    const isMobile = window.innerWidth < 768;
    const tokens = theme.global ? (isMobile ? theme.global.mobile : (theme.global.desktop || theme.global.mobile)) : (theme.settings || {});
    
    if (tokens.colors) {
      Object.entries(tokens.colors).forEach(([key, value]) => {
        // Simple kebab-case conversion
        const cssKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
        root.style.setProperty(`--color-${cssKey}`, value as string);
      });
    }

    if (tokens.spacing) {
      Object.entries(tokens.spacing).forEach(([key, value]) => {
         const cssKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
         root.style.setProperty(`--space-${cssKey}`, value as string);
      });
    }

    if (tokens.shapes) {
       Object.entries(tokens.shapes).forEach(([key, value]) => {
         const cssKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
         root.style.setProperty(`--radius-${cssKey}`, value as string);
      });
    }

  }, [theme]);

  return <>{children}</>;
};
