import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ImageUploadField } from '../components/WebSettings/ImageUploadField';
import { GoogleLocationField } from '../components/WebSettings/GoogleLocationField';

const SECTIONS = [
  { id: 'general', label: 'General' },
  { id: 'location', label: 'Default Location' },
  { id: 'country', label: 'Country Validation' },
  { id: 'support', label: 'Support Information' },
  { id: 'seo', label: 'SEO Settings' },
  { id: 'social', label: 'Social Media' },
  { id: 'app', label: 'App Download Section' },
  { id: 'features', label: 'Feature Sections' },
  { id: 'policy', label: 'Policy Settings' },
  { id: 'pwa', label: 'PWA Manifest Settings' },
  { id: 'scripts', label: 'Scripts' },
];

export function WebSettingsPage() {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/settings/web`);
      const json = await res.json();
      if (json.success) {
        setData(json.data || {});
      } else {
        setError(json.error || 'Failed to load settings');
      }
    } catch (err) {
      setError('Network error while loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/v1/admin/settings/web`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(json.error || 'Failed to save settings');
      }
    } catch (err) {
      setError('Network error while saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateData = (key: string, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    <div className="flex flex-col md:flex-row gap-8 relative">
      {/* Left Sidebar TOC */}
      <div className="w-full md:w-64 shrink-0">
        <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Web Settings</h3>
          </div>
          <nav className="flex flex-col py-2">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeSection === section.id 
                    ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600' 
                    : 'text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 pb-24">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2 text-sm font-medium border border-rose-200">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 text-sm font-medium border border-emerald-200">
            <CheckCircle2 className="h-5 w-5" />
            Settings saved successfully.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* 1. General */}
          <div id="section-general" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Site Name</label>
                <input type="text" value={data.siteName || ''} onChange={e => updateData('siteName', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Customer Website URL</label>
                <input type="url" value={data.siteUrl || ''} onChange={e => updateData('siteUrl', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Short Description</label>
                <textarea rows={3} value={data.shortDescription || ''} onChange={e => updateData('shortDescription', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <ImageUploadField label="Site Header Logo" value={data.headerLogo || ''} onChange={v => updateData('headerLogo', v)} recommendedSize="150x40px" />
              <ImageUploadField label="Dark Mode Header Logo" value={data.darkHeaderLogo || ''} onChange={v => updateData('darkHeaderLogo', v)} />
              <ImageUploadField label="Site Footer Logo" value={data.footerLogo || ''} onChange={v => updateData('footerLogo', v)} />
              <ImageUploadField label="Site Favicon" value={data.favicon || ''} onChange={v => updateData('favicon', v)} recommendedSize="32x32px" />
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Business Address</label>
                <textarea rows={2} value={data.businessAddress || ''} onChange={e => updateData('businessAddress', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Site Copyright</label>
                <input type="text" value={data.siteCopyright || ''} onChange={e => updateData('siteCopyright', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* 2. Default Location */}
          <div id="section-location" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Default Location</h2>
            <GoogleLocationField 
              label="Interactive Map Location"
              latValue={data.defaultLat}
              lngValue={data.defaultLng}
              onChange={(lat, lng) => {
                updateData('defaultLat', lat);
                updateData('defaultLng', lng);
              }}
            />
          </div>

          {/* 3. Country Validation */}
          <div id="section-country" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Country Validation</h2>
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={!!data.countryValidationEnabled} onChange={(e) => updateData('countryValidationEnabled', e.target.checked)} />
                <div className={`block w-10 h-6 rounded-full transition ${data.countryValidationEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${data.countryValidationEnabled ? 'translate-x-4' : ''}`}></div>
              </div>
              <span className="text-sm font-medium text-slate-700">Enable Country Validation</span>
            </label>
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1">Default Country</label>
               <input type="text" value={data.defaultCountry || ''} onChange={e => updateData('defaultCountry', e.target.value)} placeholder="e.g. India" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>

          {/* 4. Support Information */}
          <div id="section-support" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Support Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Support Email</label>
                <input type="email" value={data.supportEmail || ''} onChange={e => updateData('supportEmail', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Support Phone</label>
                <input type="tel" value={data.supportPhone || ''} onChange={e => updateData('supportPhone', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">WhatsApp Support Number</label>
                <input type="tel" value={data.whatsappSupport || ''} onChange={e => updateData('whatsappSupport', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Escalation Email</label>
                <input type="email" value={data.escalationEmail || ''} onChange={e => updateData('escalationEmail', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* 5. SEO Settings */}
          <div id="section-seo" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">SEO Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Meta Title</label>
                <input type="text" value={data.metaTitle || ''} onChange={e => updateData('metaTitle', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Canonical Base URL</label>
                <input type="url" value={data.canonicalBaseUrl || ''} onChange={e => updateData('canonicalBaseUrl', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Meta Keywords</label>
                <input type="text" value={data.metaKeywords || ''} onChange={e => updateData('metaKeywords', e.target.value)} placeholder="gift, personalized, custom" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Meta Description</label>
                <textarea rows={3} value={data.metaDescription || ''} onChange={e => updateData('metaDescription', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* 6. Social Media */}
          <div id="section-social" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Social Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['Facebook', 'Instagram', 'Twitter', 'YouTube', 'Pinterest', 'LinkedIn', 'Telegram'].map((social) => (
                <div key={social}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{social} URL</label>
                  <input type="url" value={data[`${social.toLowerCase()}Url`] || ''} onChange={e => updateData(`${social.toLowerCase()}Url`, e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              ))}
            </div>
          </div>

          {/* 7. App Download Section */}
          <div id="section-app" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">App Download Section</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <label className="flex items-center gap-3 cursor-pointer md:col-span-2">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={!!data.appDownloadEnabled} onChange={(e) => updateData('appDownloadEnabled', e.target.checked)} />
                  <div className={`block w-10 h-6 rounded-full transition ${data.appDownloadEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${data.appDownloadEnabled ? 'translate-x-4' : ''}`}></div>
                </div>
                <span className="text-sm font-medium text-slate-700">Enable App Download Section</span>
              </label>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Play Store URL</label>
                <input type="url" value={data.playStoreUrl || ''} onChange={e => updateData('playStoreUrl', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">App Store URL</label>
                <input type="url" value={data.appStoreUrl || ''} onChange={e => updateData('appStoreUrl', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* 8. Feature Sections */}
          <div id="section-features" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Feature Sections (JSON array)</h2>
            <textarea 
              rows={6} 
              value={data.featureSections || ''} 
              onChange={e => updateData('featureSections', e.target.value)} 
              placeholder='[{"title": "Fast Delivery", "desc": "Same day gift delivery."}]'
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-sm" 
            />
          </div>

          {/* 9. Policy Settings */}
          <div id="section-policy" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Policy Settings</h2>
            {['privacyPolicy', 'termsAndConditions', 'refundPolicy', 'shippingPolicy'].map(policy => (
               <div key={policy}>
                 <label className="block text-sm font-semibold text-slate-700 mb-1 capitalize">{policy.replace(/([A-Z])/g, ' $1').trim()}</label>
                 <textarea
                   rows={5}
                   value={data[policy] || ''}
                   onChange={e => updateData(policy, e.target.value)}
                   placeholder="Enter HTML or text policy content..."
                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-sm"
                 />
               </div>
            ))}
          </div>

          {/* 10. PWA Manifest Settings */}
          <div id="section-pwa" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">PWA Manifest Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">PWA Name</label>
                <input type="text" value={data.pwaName || ''} onChange={e => updateData('pwaName', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Theme Colour</label>
                <input type="text" value={data.pwaThemeColor || ''} onChange={e => updateData('pwaThemeColor', e.target.value)} placeholder="#ffffff" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* 11. Scripts */}
          <div id="section-scripts" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 border-l-4 border-l-amber-500">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Scripts (Restricted)</h2>
            <p className="text-sm text-slate-500 mb-4">Only provide IDs, do not inject arbitrary script tags.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Google Analytics Measurement ID</label>
                <input type="text" value={data.googleAnalyticsId || ''} onChange={e => updateData('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Meta Pixel ID</label>
                <input type="text" value={data.metaPixelId || ''} onChange={e => updateData('metaPixelId', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-white border-t border-slate-200 shadow-lg z-20 flex justify-end">
        <div className="max-w-7xl mx-auto w-full flex justify-end px-4 sm:px-8">
           <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
