import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export const GlobalStylesPage = () => {
  const { draftTheme, fetchAdminTheme, updateGlobalStyles } = useThemeStore();
  
  useEffect(() => {
    fetchAdminTheme();
  }, [fetchAdminTheme]);

  if (!draftTheme) {
    return <div>Loading...</div>;
  }

  const settings = (typeof draftTheme.settings === 'string' ? JSON.parse(draftTheme.settings || '{}') : draftTheme.settings) || {};
  const colors = settings.colors || {};
  const typography = settings.typography || {};

  const handleColorChange = (key: string, value: string) => {
    updateGlobalStyles({
      ...settings,
      colors: {
        ...colors,
        [key]: value
      }
    });
  };

  const handleTypographyChange = (key: string, value: string | number) => {
    updateGlobalStyles({
      ...settings,
      typography: {
        ...typography,
        [key]: value
      }
    });
  };

  const colorsToEdit = [
    { key: 'primary', label: 'Primary Brand Color' },
    { key: 'secondary', label: 'Secondary Color' },
    { key: 'background', label: 'Page Background' },
    { key: 'sectionAlt', label: 'Alternate Section BG' },
    { key: 'cardBg', label: 'Card Surface' },
    { key: 'textPrimary', label: 'Text Primary' },
    { key: 'textMuted', label: 'Text Muted' },
    { key: 'border', label: 'Border Color' },
    { key: 'footerBg', label: 'Footer Background' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Global Styles</h1>
        <p className="text-sm text-slate-500">Manage colors, typography, and borders across the entire site.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Colors</h3>
            <div className="space-y-4">
              {colorsToEdit.map((c) => {
                const val = colors[c.key] || '#000000';
                return (
                  <div key={c.key} className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{c.label}</label>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-slate-500 uppercase">{val}</div>
                      <input 
                        type="color" 
                        value={val}
                        onChange={(e) => handleColorChange(c.key, e.target.value)}
                        className="w-10 h-10 p-1 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Typography</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Body Font</label>
                <select 
                  value={typography.bodyFont || 'Inter'}
                  onChange={(e) => handleTypographyChange('bodyFont', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                >
                  <option value="Inter">Inter</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
