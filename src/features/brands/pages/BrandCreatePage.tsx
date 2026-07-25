import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateBrand } from '../hooks/useBrands';
import { BrandFormData, BrandStatus } from '../types/brand';
import { ArrowLeft, Save, Tag, Image, Globe, Search, ChevronRight, AlertCircle } from 'lucide-react';

export function BrandCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateBrand();

  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    slug: '',
    code: '',
    shortDescription: '',
    description: '',
    logoFileId: '',
    bannerFileId: '',
    seoImageFileId: '',
    websiteUrl: '',
    status: 'ACTIVE',
    isFeatured: false,
    sortOrder: 0,
    seoTitle: '',
    seoDescription: '',
    seoKeywordsJson: '[]',
  });

  const [autoSlug, setAutoSlug] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name,
      slug: autoSlug ? generatedSlug : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage('Brand name must be at least 2 characters.');
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      navigate('/admin/brands');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create brand');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/brands"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">
              <span>Brands</span>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-slate-500">Create</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Brand</h1>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Tag className="h-4 w-4 text-indigo-600" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Photo Frame Studio"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-slate-700">
                  Slug <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  {autoSlug ? 'Manual Edit' : 'Auto Generate'}
                </button>
              </div>
              <input
                type="text"
                required
                readOnly={autoSlug}
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="e.g. photo-frame-studio"
                className={`w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                  autoSlug ? 'bg-slate-50 text-slate-500' : 'bg-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Brand Code (Optional)</label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="e.g. BRD-PFS-01"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Website URL (Optional)</label>
              <input
                type="url"
                value={formData.websiteUrl || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Short Description</label>
            <input
              type="text"
              maxLength={250}
              value={formData.shortDescription || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
              placeholder="Brief overview of brand offerings..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Description</label>
            <textarea
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed brand story, materials used, custom printing capabilities..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Media Attachments */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Image className="h-4 w-4 text-indigo-600" />
            Media & Asset References
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Logo File Asset ID</label>
              <input
                type="text"
                value={formData.logoFileId || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, logoFileId: e.target.value }))}
                placeholder="e.g. img-logo-001"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Role: BRAND_LOGO (Max 2MB)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Banner File Asset ID</label>
              <input
                type="text"
                value={formData.bannerFileId || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, bannerFileId: e.target.value }))}
                placeholder="e.g. img-banner-001"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Role: BRAND_BANNER (Max 8MB)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">SEO Image File Asset ID</label>
              <input
                type="text"
                value={formData.seoImageFileId || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, seoImageFileId: e.target.value }))}
                placeholder="e.g. img-seo-001"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Role: SEO_IMAGE (Max 5MB)</p>
            </div>
          </div>
        </div>

        {/* Status & Display Settings */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Visibility & Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as BrandStatus }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isFeatured" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Mark as Featured Brand
              </label>
            </div>
          </div>
        </div>

        {/* SEO Metadata */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="h-4 w-4 text-indigo-600" />
            SEO & Search Optimization
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">SEO Meta Title</label>
              <input
                type="text"
                value={formData.seoTitle || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
                placeholder="e.g. Photo Frame Studio Jaipur | Personalised LED Frames"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">SEO Meta Description</label>
              <textarea
                rows={2}
                value={formData.seoDescription || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
                placeholder="Search engine snippet preview text..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">SEO Keywords (JSON Array)</label>
              <input
                type="text"
                value={formData.seoKeywordsJson || '[]'}
                onChange={(e) => setFormData((prev) => ({ ...prev, seoKeywordsJson: e.target.value }))}
                placeholder='["photo frame", "jaipur gifts", "acrylic frame"]'
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-700 block">Canonical Path Preview:</span>
              <code className="text-indigo-600 font-mono">/brands/{formData.slug || 'brand-slug'}</code>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/admin/brands"
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {createMutation.isPending ? 'Saving Brand...' : 'Save Brand'}
          </button>
        </div>
      </form>
    </div>
  );
}
