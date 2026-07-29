import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Folder, 
  Layers, 
  Sparkles, 
  Check, 
  AlertTriangle,
  Globe,
  Star,
  Home,
  Tag,
  Info
} from 'lucide-react';
import { Category, CategoryFormData, CategoryStatus } from '../types/category';
import { categoryApi } from '../services/categoryApi';
import { cn } from '../../../lib/utils';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  editingCategory?: Category | null;
  defaultParentId?: string | null;
  categoryFormMode?: 'PARENT' | 'CHILD' | 'SUB_CHILD';
  flatCategoriesList: Array<{ id: string; name: string; level: number; path: string | null; slug: string }>;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCategory,
  defaultParentId,
  categoryFormMode = 'PARENT',
  flatCategoriesList
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'visibility' | 'seo'>('basic');
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customSlug, setCustomSlug] = useState<boolean>(false);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    code: '',
    parentId: null,
    storeId: null,
    shortDescription: '',
    description: '',
    imageFileId: null,
    imageUrl: null,
    iconFileId: null,
    iconUrl: null,
    desktopBannerFileId: null,
    desktopBannerUrl: null,
    mobileBannerFileId: null,
    mobileBannerUrl: null,
    mobileImageFileId: null,
    mobileImageUrl: null,
    showInNavigation: true,
    showInSearch: true,
    showOnDesktop: true,
    showOnMobile: true,
    imageAltText: '',
    bannerAltText: '',
    bgColour: '',
    textColour: '',
    status: 'ACTIVE',
    isFeatured: false,
    showOnHomepage: false,
    sortOrder: 1,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    seoImageFileId: null,
    seoImageUrl: null,
  });

  // Uploading states
  const [uploadingRole, setUploadingRole] = useState<string | null>(null);

  useEffect(() => {
    if (editingCategory) {
      let keywordsStr = '';
      if (editingCategory.seoKeywordsJson) {
        try {
          const parsed = JSON.parse(editingCategory.seoKeywordsJson);
          keywordsStr = Array.isArray(parsed) ? parsed.join(', ') : parsed;
        } catch {
          keywordsStr = editingCategory.seoKeywordsJson;
        }
      }

      setFormData({
        name: editingCategory.name || '',
        slug: editingCategory.slug || '',
        code: editingCategory.code || '',
        parentId: editingCategory.parentId || null,
        storeId: editingCategory.storeId || null,
        shortDescription: editingCategory.shortDescription || '',
        description: editingCategory.description || '',
        imageFileId: editingCategory.imageFileId || null,
        imageUrl: editingCategory.imageUrl || null,
        iconFileId: editingCategory.iconFileId || null,
        iconUrl: editingCategory.iconUrl || null,
        desktopBannerFileId: editingCategory.desktopBannerFileId || null,
        desktopBannerUrl: editingCategory.desktopBannerUrl || null,
        mobileBannerFileId: editingCategory.mobileBannerFileId || null,
        mobileBannerUrl: editingCategory.mobileBannerUrl || null,
        mobileImageFileId: (editingCategory as any).mobileImageFileId || null,
        mobileImageUrl: (editingCategory as any).mobileImageUrl || null,
        showInNavigation: (editingCategory as any).showInNavigation ?? true,
        showInSearch: (editingCategory as any).showInSearch ?? true,
        showOnDesktop: (editingCategory as any).showOnDesktop ?? true,
        showOnMobile: (editingCategory as any).showOnMobile ?? true,
        imageAltText: (editingCategory as any).imageAltText || '',
        bannerAltText: (editingCategory as any).bannerAltText || '',
        bgColour: (editingCategory as any).bgColour || '',
        textColour: (editingCategory as any).textColour || '',
        status: editingCategory.status || 'ACTIVE',
        isFeatured: editingCategory.isFeatured || false,
        showOnHomepage: editingCategory.showOnHomepage || false,
        sortOrder: editingCategory.sortOrder || 1,
        seoTitle: editingCategory.seoTitle || '',
        seoDescription: editingCategory.seoDescription || '',
        seoKeywords: keywordsStr,
        seoImageFileId: editingCategory.seoImageFileId || null,
        seoImageUrl: editingCategory.seoImageUrl || null,
      });
      setCustomSlug(true);
    } else {
      setFormData({
        name: '',
        slug: '',
        code: '',
        parentId: defaultParentId || null,
        mobileImageFileId: null,
        mobileImageUrl: null,
        showInNavigation: true,
        showInSearch: true,
        showOnDesktop: true,
        showOnMobile: true,
        imageAltText: '',
        bannerAltText: '',
        bgColour: '',
        textColour: '',
        storeId: null,
        shortDescription: '',
        description: '',
        imageFileId: null,
        imageUrl: null,
        iconFileId: null,
        iconUrl: null,
        desktopBannerFileId: null,
        desktopBannerUrl: null,
        mobileBannerFileId: null,
        mobileBannerUrl: null,
        status: 'ACTIVE',
        isFeatured: false,
        showOnHomepage: false,
        sortOrder: 1,
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        seoImageFileId: null,
        seoImageUrl: null,
      });
      setCustomSlug(false);
    }
    setErrorMessage(null);
    setActiveTab('basic');
  }, [editingCategory, defaultParentId, isOpen]);

  // Auto-generate slug when name changes if not customSlug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (!customSlug) {
      const generatedSlug = newName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prev => ({
        ...prev,
        name: newName,
        slug: generatedSlug,
        seoTitle: prev.seoTitle || `${newName} Jaipur | Personalised Gifts Online`
      }));
    } else {
      setFormData(prev => ({ ...prev, name: newName }));
    }
  };

  // Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, role: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingRole(role);
      const res = await categoryApi.uploadMedia(file, role);

      if (role === 'CATEGORY_IMAGE') {
        setFormData(prev => ({ ...prev, imageFileId: res.fileAssetId, imageUrl: res.url }));
      } else if (role === 'CATEGORY_ICON') {
        setFormData(prev => ({ ...prev, iconFileId: res.fileAssetId, iconUrl: res.url }));
      } else if (role === 'CATEGORY_DESKTOP_BANNER') {
        setFormData(prev => ({ ...prev, desktopBannerFileId: res.fileAssetId, desktopBannerUrl: res.url }));
      } else if (role === 'CATEGORY_MOBILE_BANNER') {
        setFormData(prev => ({ ...prev, mobileBannerFileId: res.fileAssetId, mobileBannerUrl: res.url }));
      } else if (role === 'CATEGORY_MOBILE_IMAGE') {
        setFormData(prev => ({ ...prev, mobileImageFileId: res.fileAssetId, mobileImageUrl: res.url }));
      } else if (role === 'SEO_IMAGE') {
        setFormData(prev => ({ ...prev, seoImageFileId: res.fileAssetId, seoImageUrl: res.url }));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload media asset');
    } finally {
      setUploadingRole(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryFormMode !== 'PARENT' && !formData.parentId) {
      setErrorMessage('Parent Category selection is required.');
      setActiveTab('basic');
      return;
    }
    if (!formData.name.trim()) {
      setErrorMessage('Category Name is required.');
      setActiveTab('basic');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);
      await onSubmit(formData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Filter available parent choices (exclude self and descendants)
  const validParents = flatCategoriesList.filter(c => {
    if (!editingCategory) return true;
    if (c.id === editingCategory.id) return false;
    // Check if c is descendant of editingCategory
    if (c.path && c.path.includes(editingCategory.id)) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <p className="text-xs text-slate-500">
                {editingCategory ? `Updating category ID: ${editingCategory.id}` : 'Add main or subcategory for Jaipur Gifting platform'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={cn(
              "py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeTab === 'basic'
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            1. Basic Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={cn(
              "py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeTab === 'media'
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            2. Media & Banners
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('visibility')}
            className={cn(
              "py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeTab === 'visibility'
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            3. Visibility & Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={cn(
              "py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeTab === 'seo'
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            4. SEO Settings
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-4">

              {/* Manual Parent Category Selection */}
              {categoryFormMode !== 'PARENT' && (
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    Select {categoryFormMode === 'CHILD' ? 'Parent' : 'Child'} Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="" disabled>-- Select Category --</option>
                    {flatCategoriesList
                      .filter(c => c.level === (categoryFormMode === 'CHILD' ? 1 : 2))
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Custom Wooden Photo Frames"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomSlug(!customSlug)}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                  >
                    {customSlug ? 'Auto-generate from Name' : 'Customize Slug'}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">/</span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => {
                      setCustomSlug(true);
                      setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().trim() }));
                    }}
                    placeholder="custom-wooden-photo-frames"
                    className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {!categoryFormMode && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Parent Category
                  </label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value || null }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">-- None (Top Level Main Category) --</option>
                    {validParents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {'— '.repeat(p.level - 1)}{p.name} (L{p.level})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Selecting a parent nests this category under it. Maximum hierarchy depth allowed is 6 levels.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category Code (SKU Prefix / Internal Identifier)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. CAT-WOOD-01"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category Styling Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Theme Background Color (HEX)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.bgColour || '#ffffff'}
                      onChange={(e) => setFormData(prev => ({ ...prev, bgColour: e.target.value }))}
                      className="w-10 h-10 border border-slate-300 rounded-lg p-1 cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.bgColour || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bgColour: e.target.value }))}
                      placeholder="#ffffff"
                      maxLength={7}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Theme Text Color (HEX)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.textColour || '#000000'}
                      onChange={(e) => setFormData(prev => ({ ...prev, textColour: e.target.value }))}
                      className="w-10 h-10 border border-slate-300 rounded-lg p-1 cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.textColour || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, textColour: e.target.value }))}
                      placeholder="#000000"
                      maxLength={7}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Short Summary / Tagline
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="e.g. Handcrafted wooden & LED photo frames with 90-min delivery."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Full description shown on category landing page..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA & BANNERS */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Category Main Image */}
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category Main Thumbnail Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-slate-400 shrink-0">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Category" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="cat-image-upload"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'CATEGORY_IMAGE')}
                    />
                    <label
                      htmlFor="cat-image-upload"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingRole === 'CATEGORY_IMAGE' ? 'Uploading...' : 'Choose File'}
                    </label>
                    <p className="text-[11px] text-slate-500">Recommended: Square PNG / WebP, min 400x400px.</p>
                  </div>
                </div>
              </div>

              
              {/* Category Mobile Image */}
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category Mobile Thumbnail Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-slate-400 shrink-0">
                    {formData.mobileImageUrl ? (
                      <img src={formData.mobileImageUrl} alt="Category Mobile" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="cat-mobile-image-upload"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'CATEGORY_MOBILE_IMAGE')}
                    />
                    <label
                      htmlFor="cat-mobile-image-upload"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingRole === 'CATEGORY_MOBILE_IMAGE' ? 'Uploading...' : 'Choose File'}
                    </label>
                    <p className="text-[11px] text-slate-500">Recommended: Portrait PNG / WebP, 750x900px.</p>
                  </div>
                </div>
              </div>

              {/* Category Icon */}
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category Navigation Icon
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-slate-400 shrink-0">
                    {formData.iconUrl ? (
                      <img src={formData.iconUrl} alt="Icon" className="w-full h-full object-cover" />
                    ) : (
                      <Folder className="w-6 h-6 text-indigo-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="cat-icon-upload"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'CATEGORY_ICON')}
                    />
                    <label
                      htmlFor="cat-icon-upload"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingRole === 'CATEGORY_ICON' ? 'Uploading...' : 'Upload Icon SVG/PNG'}
                    </label>
                    <p className="text-[11px] text-slate-500">Used in mobile menu & navbar, 100x100px.</p>
                  </div>
                </div>
              </div>

              {/* Desktop Banner */}
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Desktop Header Banner
                </label>
                <div className="space-y-3">
                  {formData.desktopBannerUrl && (
                    <div className="w-full h-24 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden">
                      <img src={formData.desktopBannerUrl} alt="Desktop Banner" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    id="cat-desktop-banner"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'CATEGORY_DESKTOP_BANNER')}
                  />
                  <label
                    htmlFor="cat-desktop-banner"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingRole === 'CATEGORY_DESKTOP_BANNER' ? 'Uploading...' : 'Upload Desktop Banner'}
                  </label>
                </div>
              </div>

              {/* Mobile Banner */}
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Mobile Header Banner
                </label>
                <div className="space-y-3">
                  {formData.mobileBannerUrl && (
                    <div className="w-full h-20 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden">
                      <img src={formData.mobileBannerUrl} alt="Mobile Banner" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    id="cat-mobile-banner"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'CATEGORY_MOBILE_BANNER')}
                  />
                  <label
                    htmlFor="cat-mobile-banner"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingRole === 'CATEGORY_MOBILE_BANNER' ? 'Uploading...' : 'Upload Mobile Banner'}
                  </label>
                </div>
              </div>

              {/* Image Alt Texts (SEO & Accessibility) */}
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> Image Alt Attributes (SEO & Accessibility)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Main/Mobile Thumbnail Alt Text
                    </label>
                    <input
                      type="text"
                      value={formData.imageAltText || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageAltText: e.target.value }))}
                      placeholder="e.g. Handmade wooden picture frame with lights"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Header Banner Alt Text
                    </label>
                    <input
                      type="text"
                      value={formData.bannerAltText || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bannerAltText: e.target.value }))}
                      placeholder="e.g. Personalised Diwali gifts banner Jaipur"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VISIBILITY & STATUS */}
          {activeTab === 'visibility' && (
            <div className="space-y-6">
              {/* Active / Inactive Status */}
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Category Active Status</h4>
                  <p className="text-xs text-slate-500">Inactivating hides category and its products from customer frontend.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }))}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                    formData.status === 'ACTIVE'
                      ? "bg-emerald-600 text-white border-emerald-700"
                      : "bg-slate-200 text-slate-700 border-slate-300"
                  )}
                >
                  {formData.status === 'ACTIVE' ? 'Status: ACTIVE' : 'Status: INACTIVE'}
                </button>
              </div>

              {/* Featured Category Toggle */}
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" /> Mark as Featured Category
                  </h4>
                  <p className="text-xs text-slate-500">Featured categories get priority placement in navigation menus & quick chips.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Show on Homepage Toggle */}
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-emerald-600" /> Display on Blinkit Homepage Carousel
                  </h4>
                  <p className="text-xs text-slate-500">Shows this category directly on customer home grid sections.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showOnHomepage}
                  onChange={(e) => setFormData(prev => ({ ...prev, showOnHomepage: e.target.checked }))}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Additional Visibility Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Show in Navigation</h5>
                    <p className="text-[10px] text-slate-400">Display in top menu & catalog bar.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.showInNavigation ?? true}
                    onChange={(e) => setFormData(prev => ({ ...prev, showInNavigation: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Show in Search</h5>
                    <p className="text-[10px] text-slate-400">Allow users to discover via search.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.showInSearch ?? true}
                    onChange={(e) => setFormData(prev => ({ ...prev, showInSearch: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Show on Desktop</h5>
                    <p className="text-[10px] text-slate-400">Enable for desktop browsers.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.showOnDesktop ?? true}
                    onChange={(e) => setFormData(prev => ({ ...prev, showOnDesktop: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Show on Mobile</h5>
                    <p className="text-[10px] text-slate-400">Enable for mobile app & mobile web.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.showOnMobile ?? true}
                    onChange={(e) => setFormData(prev => ({ ...prev, showOnMobile: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sort Order Priority Number
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Lower numbers appear first (e.g. 1, 2, 3).</p>
              </div>
            </div>
          )}

          {/* TAB 4: SEO SETTINGS */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="Personalised Gifts Jaipur | Custom Name Gifts Online"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  SEO Meta Description
                </label>
                <textarea
                  rows={3}
                  value={formData.seoDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="Buy custom printed photo frames, mugs and Jaipur handicrafts with 90-min instant delivery."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  SEO Keywords (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoKeywords: e.target.value }))}
                  placeholder="personalised gifts, jaipur gifts, custom photo frame, express gifting"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* SEO OpenGraph Image */}
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Social Sharing OpenGraph Image (1200x630px)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-14 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-slate-400 shrink-0">
                    {formData.seoImageUrl ? (
                      <img src={formData.seoImageUrl} alt="SEO Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Globe className="w-6 h-6 text-indigo-500" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    id="seo-img-upload"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'SEO_IMAGE')}
                  />
                  <label
                    htmlFor="seo-img-upload"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingRole === 'SEO_IMAGE' ? 'Uploading...' : 'Upload OpenGraph Image'}
                  </label>
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {editingCategory ? 'Update Category' : 'Save Category'}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
