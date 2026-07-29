import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../../frontend/components/ui/Button';
import { Save, ExternalLink } from 'lucide-react';
import { themeApi } from '../services/themeApi';

export const ThemeDashboardPage = () => {
  const { draftTheme, fetchAdminTheme, publishDraft, hasUnsavedChanges } = useThemeStore();
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    fetchAdminTheme();
    themeApi.getThemeVersions().then(res => setVersions(res.data || []));
  }, [fetchAdminTheme]);

  if (!draftTheme) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Theme Dashboard</h1>
          <p className="text-sm text-slate-500">Manage your active theme and publish changes to the storefront.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-xs">
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Preview Storefront
          </Button>
          <Button onClick={() => publishDraft()} className="bg-indigo-600 text-white text-xs">
            <Save className="w-3.5 h-3.5 mr-1.5" /> Publish to Live
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-2">Current Draft</h3>
          <p className="text-sm text-slate-500 mb-4">Version: {draftTheme.version}</p>
          <p className="text-sm">Status: {draftTheme.status}</p>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="font-bold text-lg mb-4">Version History</h3>
        <div className="space-y-2">
          {versions.map(v => (
            <div key={v.id} className="bg-white dark:bg-slate-900 border p-4 rounded-xl flex justify-between">
              <div>
                <span className="font-bold">Version {v.version}</span>
                <p className="text-xs text-slate-500">{new Date(v.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
