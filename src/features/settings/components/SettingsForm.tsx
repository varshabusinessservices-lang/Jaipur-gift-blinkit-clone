import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../lib/axios';
import { ImageUploadField } from './WebSettings/ImageUploadField';

export interface SettingsField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'toggle' | 'textarea' | 'status' | 'select' | 'password' | 'image';
  options?: { label: string; value: string | number | boolean }[];
  description?: string;
  placeholder?: string;
  readOnly?: boolean;
}

export interface SettingsFormProps {
  title: string;
  description: string;
  namespace: string;
  fields: SettingsField[];
  onSave?: () => void;
  children?: React.ReactNode;
}

export function SettingsForm({ title, description, namespace, fields, onSave, children }: SettingsFormProps) {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [namespace]);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/admin/settings/${namespace}`);
      const json = res.data;
      if (json.success) {
        setData(json.data || {});
      } else {
        setError(json.error || 'Failed to load settings');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Network error while loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await apiClient.patch(`/admin/settings/${namespace}`, data);
      const json = res.data;
      if (json.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        if (onSave) onSave();
      } else {
        setError(json.error || 'Failed to save settings');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Network error while saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-5 w-5" />
            Settings saved successfully.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              {field.type === 'text' || field.type === 'number' || field.type === 'password' ? (
                <>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type === 'number' ? 'number' : field.type === 'password' ? 'password' : 'text'}
                    value={data[field.key] || ''}
                    onChange={(e) => setData({ ...data, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                    placeholder={field.placeholder}
                    readOnly={field.readOnly}
                    className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${field.readOnly ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-900'}`}
                  />
                </>
              ) : field.type === 'textarea' ? (
                <>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    {field.label}
                  </label>
                  <textarea
                    value={data[field.key] || ''}
                    onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    readOnly={field.readOnly}
                    rows={4}
                    className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${field.readOnly ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-900'}`}
                  />
                </>
              ) : field.type === 'select' ? (
                <>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    {field.label}
                  </label>
                  <select
                    value={data[field.key] !== undefined ? String(data[field.key]) : ''}
                    onChange={(e) => {
                      let val: any = e.target.value;
                      if (val === 'true') val = true;
                      if (val === 'false') val = false;
                      setData({ ...data, [field.key]: val });
                    }}
                    disabled={field.readOnly}
                    className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${field.readOnly ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-900'}`}
                  >
                    <option value="" disabled>Select option...</option>
                    {field.options?.map((opt, idx) => (
                      <option key={idx} value={String(opt.value)}>{opt.label}</option>
                    ))}
                  </select>
                </>
              ) : field.type === 'toggle' ? (
                <>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    {field.label}
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer mt-2">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={!!data[field.key]}
                        disabled={field.readOnly}
                        onChange={(e) => setData({ ...data, [field.key]: e.target.checked })}
                      />
                      <div className={`block w-10 h-6 rounded-full transition ${data[field.key] ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${data[field.key] ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {data[field.key] ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </>
              ) : field.type === 'status' ? (
                <>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    {field.label}
                  </label>
                  <div className="flex items-center gap-2 h-10">
                     <div className={`h-2.5 w-2.5 rounded-full ${data[field.key] === 'OK' || data[field.key] === 'Healthy' || data[field.key] === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                     <span className="text-sm font-medium text-slate-900">{data[field.key] || 'Checking...'}</span>
                  </div>
                </>
              ) : field.type === 'image' ? (
                <ImageUploadField
                  label={field.label}
                  value={data[field.key] || ''}
                  onChange={(val) => setData({ ...data, [field.key]: val })}
                  description={field.description}
                />
              ) : null}

              {field.description && (
                <p className="mt-1.5 text-xs text-slate-500">{field.description}</p>
              )}
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
      {children && <div className="border-t border-slate-200 bg-slate-50">{children}</div>}
    </div>
  );
}
