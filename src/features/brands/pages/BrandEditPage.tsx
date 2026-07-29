import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBrand, useUpdateBrand } from '../hooks/useBrands';
import { BrandFormData, BrandStatus } from '../types/brand';
import { ArrowLeft, Save, Tag, Image, Globe, ChevronRight, AlertCircle, RefreshCw, Upload, X } from 'lucide-react';
import { brandApi } from '../services/brandApi';

export function BrandEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: brand, isLoading, isError, error } = useBrand(id || '');
  const updateMutation = useUpdateBrand();

  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    slug: '',
    code: '',
    shortDescription: '',
    description: '',
    logoFileId: '',
    logoAltText: '',
    seoImageFileId: '',
    seoImageAltText: '',
    logoUrl: '',
    seoImageUrl: '',
    websiteUrl: '',
    status: 'ACTIVE',
    isFeatured: false,
    sortOrder: 0,
    seoTitle: '',
    seoDescription: '',
    seoKeywordsJson: '[]',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [uploadingRole, setUploadingRole] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
        slug: brand.slug || '',
        code: brand.code || '',
        shortDescription: brand.shortDescription || '',
        description: brand.description || '',
        logoFileId: brand.logoFileId || '',
        logoAltText: brand.logoAltText || '',
        seoImageFileId: brand.seoImageFileId || '',
        seoImageAltText: brand.seoImageAltText || '',
        logoUrl: brand.logoUrl || '',
        seoImageUrl: brand.seoImageUrl || '',
        websiteUrl: brand.websiteUrl || '',
        status: brand.status || 'ACTIVE',
        isFeatured: brand.isFeatured ?? false,
        sortOrder: brand.sortOrder ?? 0,
        seoTitle: brand.seoTitle || '',
        seoDescription: brand.seoDescription || '',
        seoKeywordsJson: brand.seoKeywordsJson || '[]',
      });
    }
  }, [brand]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, role: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingRole(role);
      setUploadError(null);
      const res = await brandApi.uploadMedia(file, role);

      if (role === 'BRAND_LOGO') {
        setFormData((prev) => ({
          ...prev,
          logoFileId: res.fileAssetId,
          logoUrl: res.url,
        }));
      } else if (role === 'SEO_IMAGE') {
        setFormData((prev) => ({
          ...prev,
          seoImageFileId: res.fileAssetId,
          seoImageUrl: res.url,
        }));
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload media asset');
    } finally {
      setUploadingRole(null);
    }
  };

  const handleRemoveFile = (role: string) => {
    if (role === 'BRAND_LOGO') {
      setFormData((prev) => ({
        ...prev,
        logoFileId: '',
        logoUrl: '',
      }));
    } else if (role === 'SEO_IMAGE') {
      setFormData((prev) => ({
        ...prev,
        seoImageFileId: '',
        seoImageUrl: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!id) return;
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage('Brand name must be at least 2 characters.');
      return;
    }

    if (!formData.logoFileId) {
      setErrorMessage('Brand Logo is mandatory.');
      return;
    }

    try {
      await updateMutation.mutateAsync({ id, data: formData });
      navigate('/admin/brands');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update brand');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        <span>Loading brand details...</span>
      </div>
    );
  }

  if (isError || !brand) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Brand Not Found</h2>
        <p className="text-sm text-slate-500">{(error as any)?.message || 'The requested brand could not be found or has been removed.'}</p>
        <Link
          to="/admin/brands"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Brands Directory
        </Link>
      </div>
    );
  }

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
              <span className="text-slate-500">Edit #{brand.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Brand — {brand.name}</h1>
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
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Slug <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Brand Code (Optional)</label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Website URL (Optional)</label>
              <input
                type="url"
                value={formData.websiteUrl || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, websiteUrl: e.target.value }))}
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
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Description</label>
            <textarea
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Media Attachments */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Image className="h-4 w-4 text-indigo-600" />
            Brand Media
          </h2>

          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BRAND LOGO (MANDATORY) */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Brand Logo <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500">Mandatory logo representing the brand across the storefront.</p>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-slate-400 shrink-0 relative group">
                  {formData.logoUrl ? (
                    <>
                      <img src={formData.logoUrl} alt={formData.logoAltText || 'Brand Logo'} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('BRAND_LOGO')}
                          className="p-1.5 bg-white text-rose-600 rounded-full hover:bg-rose-50 shadow-sm transition-colors cursor-pointer"
                          title="Remove Logo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <Image className="w-10 h-10 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="brand-logo-upload"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'BRAND_LOGO')}
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="brand-logo-upload"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingRole === 'BRAND_LOGO' ? 'Uploading...' : formData.logoUrl ? 'Replace Image' : 'Choose File'}
                    </label>
                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('BRAND_LOGO')}
                        className="px-3 py-2 border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-50 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">Recommended: Square PNG / WebP, max 2MB.</p>
                </div>
              </div>

              {formData.logoUrl && (
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Logo Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.logoAltText || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, logoAltText: e.target.value }))}
                    placeholder="e.g. Photo Frame Studio customized wooden gifts logo"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* SEO IMAGE (OPTIONAL) */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">
                  SEO Image (Optional)
                </label>
                <p className="text-xs text-slate-500">Image displayed when sharing the brand link on social media.</p>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-slate-400 shrink-0 relative group">
                  {formData.seoImageUrl ? (
                    <>
                      <img src={formData.seoImageUrl} alt={formData.seoImageAltText || 'SEO'} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('SEO_IMAGE')}
                          className="p-1.5 bg-white text-rose-600 rounded-full hover:bg-rose-50 shadow-sm transition-colors cursor-pointer"
                          title="Remove SEO Image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <Image className="w-10 h-10 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="brand-seo-upload"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'SEO_IMAGE')}
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="brand-seo-upload"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingRole === 'SEO_IMAGE' ? 'Uploading...' : formData.seoImageUrl ? 'Replace Image' : 'Choose File'}
                    </label>
                    {formData.seoImageUrl && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('SEO_IMAGE')}
                        className="px-3 py-2 border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-50 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">Recommended: Landscape PNG / WebP, max 5MB.</p>
                </div>
              </div>

              {formData.seoImageUrl && (
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    SEO Image Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.seoImageAltText || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoImageAltText: e.target.value }))}
                    placeholder="e.g. Photo Frame Studio gallery display social share preview"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
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
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">SEO Meta Description</label>
              <textarea
                rows={2}
                value={formData.seoDescription || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">SEO Keywords (JSON Array)</label>
              <input
                type="text"
                value={formData.seoKeywordsJson || '[]'}
                onChange={(e) => setFormData((prev) => ({ ...prev, seoKeywordsJson: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
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
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Updating Brand...' : 'Update Brand'}
          </button>
        </div>
      </form>
    </div>
  );
}
