import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ProductType,
  ProductStatus,
  ProductVisibility,
  ProductCondition,
  CreateProductInput,
  ProductDetail,
  ProductBadge,
} from '../types/product';
import { ProductTypeSelector } from './ProductTypeSelector';
import { categoryApi } from '../../categories/services/categoryApi';
import { brandApi } from '../../brands/services/brandApi';
import { taxRateApi } from '../../taxRates/services/taxRateApi';
import { TaxRate } from '../../taxRates/types/taxRate';
import { productAttributeApi } from '../../productAttributes/services/productAttributeApi';
import { ProductAttributeDetail } from '../../productAttributes/types/productAttribute';
import { calculateTax } from '../../../utils/taxCalculator';
import { generateVariationCombinations, AttributeSelectionInput } from '../../../utils/variationCombinator';
import {
  Package,
  DollarSign,
  Truck,
  Layers,
  Image as ImageIcon,
  Globe,
  ArrowLeft,
  ArrowRight,
  Save,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface ProductFormWizardProps {
  initialData?: ProductDetail;
  onSubmit: (data: CreateProductInput) => Promise<void>;
  loading?: boolean;
  mode: 'create' | 'edit';
}

const STEPS = [
  { id: 1, title: 'Basic Info & Type', icon: Package, desc: 'Title, category, brand, type' },
  { id: 2, title: 'Pricing & Tax', icon: DollarSign, desc: 'MRP, selling price, GST tax' },
  { id: 3, title: 'Inventory & Shipping', icon: Truck, desc: 'Stock quantity, same-day delivery' },
  { id: 4, title: 'Attributes & Variations', icon: Layers, desc: 'Colour, size, material specs' },
  { id: 5, title: 'Media & Badges', icon: ImageIcon, desc: 'Product gallery, badges' },
  { id: 6, title: 'SEO & Search', icon: Globe, desc: 'SEO title, meta description, slug' },
];

const AVAILABLE_BADGES: { badge: ProductBadge; label: string; desc: string }[] = [
  { badge: 'PERSONALISED', label: 'Personalised', desc: 'Custom photo, name, or text required' },
  { badge: 'NEW', label: 'New Arrival', desc: 'Highlights freshly launched products' },
  { badge: 'HOT', label: 'Hot / Trending', desc: 'Fast moving item badge' },
  { badge: 'FLASH_SALE', label: 'Flash Sale', desc: 'Limited duration discount offer' },
  { badge: 'BEST_SELLER', label: 'Best Seller', desc: 'Jaipur customer top choice' },
  { badge: 'SAME_DAY', label: '90-Min / Same-Day', desc: 'Eligible for instant Jaipur delivery' },
  { badge: 'EXCLUSIVE', label: 'Jaipur Exclusive', desc: 'Exclusively crafted local item' },
];

export function ProductFormWizard({ initialData, onSubmit, loading, mode }: ProductFormWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Options state
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [attributes, setAttributes] = useState<ProductAttributeDetail[]>([]);

  // Main Form State
  const [formData, setFormData] = useState<CreateProductInput>({
    productType: initialData?.productType || 'SIMPLE',
    status: initialData?.status || 'DRAFT',
    visibility: initialData?.visibility || 'PUBLIC',
    condition: initialData?.condition || 'NEW',
    title: initialData?.title || '',
    internalName: initialData?.internalName || '',
    slug: initialData?.slug || '',
    sku: initialData?.sku || '',
    barcode: initialData?.barcode || '',
    brandId: initialData?.brandId || '',
    primaryCategoryId: initialData?.primaryCategoryId || '',
    additionalCategoryIds: initialData?.categoryAssignments
      ?.filter((c) => !c.isPrimary)
      .map((c) => c.categoryId) || [],
    shortDescription: initialData?.shortDescription || '',
    description: initialData?.description || '',
    careInstructions: initialData?.careInstructions || '',
    countryOfOrigin: initialData?.countryOfOrigin || 'India',
    manufacturer: initialData?.manufacturer || 'Jaipur Gifting Crafts Ltd',
    packer: initialData?.packer || 'Jaipur Gifting Crafts Ltd',
    importer: initialData?.importer || '',
    hsnCode: initialData?.hsnCode || '44140000',
    taxRateId: initialData?.taxRateId || '',
    mrp: initialData?.mrp ? parseFloat(initialData.mrp) : undefined,
    sellingPrice: initialData?.sellingPrice ? parseFloat(initialData.sellingPrice) : undefined,
    costPrice: initialData?.costPrice ? parseFloat(initialData.costPrice) : undefined,
    priceIncludesTax: initialData?.priceIncludesTax ?? true,
    minimumOrderQuantity: initialData?.minimumOrderQuantity || 1,
    maximumOrderQuantity: initialData?.maximumOrderQuantity || undefined,
    manageStock: initialData?.manageStock ?? true,
    stockQuantity: initialData?.stockQuantity ?? 10,
    reservedStock: initialData?.reservedStock || 0,
    lowStockThreshold: initialData?.lowStockThreshold || 5,
    allowBackorder: initialData?.allowBackorder ?? false,
    weightGrams: initialData?.weightGrams ? parseFloat(initialData.weightGrams) : undefined,
    lengthCm: initialData?.lengthCm ? parseFloat(initialData.lengthCm) : undefined,
    widthCm: initialData?.widthCm ? parseFloat(initialData.widthCm) : undefined,
    heightCm: initialData?.heightCm ? parseFloat(initialData.heightCm) : undefined,
    isFragile: initialData?.isFragile ?? false,
    requiresSpecialPackaging: initialData?.requiresSpecialPackaging ?? false,
    sameDayEligible: initialData?.sameDayEligible ?? true,
    nextDayEligible: initialData?.nextDayEligible ?? true,
    expressEligible: initialData?.expressEligible ?? true,
    storePickupEligible: initialData?.storePickupEligible ?? true,
    maximumSameDayDistanceKm: initialData?.maximumSameDayDistanceKm
      ? parseFloat(initialData.maximumSameDayDistanceKm)
      : 15,
    preparationTimeMinutes: initialData?.preparationTimeMinutes || 30,
    packingTimeMinutes: initialData?.packingTimeMinutes || 15,
    isPersonalised: initialData?.isPersonalised ?? (initialData?.productType === 'PERSONALISED'),
    isFeatured: initialData?.isFeatured ?? false,
    sortOrder: initialData?.sortOrder || 0,
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    seoKeywordsJson: initialData?.seoKeywordsJson || '',
    mainImageFileId: initialData?.mainImageFileId || '',
    attributeAssignments: initialData?.attributeAssignments?.map((a) => ({
      attributeId: a.attributeId,
      isRequired: a.isRequired,
      isVariationAttribute: a.isVariationAttribute,
      isFilterable: a.isFilterable,
      sortOrder: a.sortOrder,
      valueIds: a.values.map((v) => v.valueId),
    })) || [],
    media: initialData?.media?.map((m) => ({
      fileAssetId: m.fileAssetId,
      url: m.url,
      mediaType: m.mediaType,
      isPrimary: m.isPrimary,
      altText: m.altText,
      sortOrder: m.sortOrder,
    })) || [
      {
        fileAssetId: 'img-placeholder-1',
        url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
        isPrimary: true,
        sortOrder: 1,
        altText: 'Primary Product Image',
      },
    ],
    badges: initialData?.badges?.map((b) => ({
      badge: b.badge,
      source: b.source,
      active: b.active,
    })) || [
      { badge: 'SAME_DAY', source: 'AUTOMATIC', active: true },
    ],
  });

  // Selected Attribute & Variation combinations generator preview
  const [variationSelections, setVariationSelections] = useState<AttributeSelectionInput[]>([]);
  const [variationPreview, setVariationPreview] = useState<any>(null);

  // Fetch Category, Brand, Tax Rate options
  useEffect(() => {
    categoryApi.getCategories({}).then((res) => setCategories(res.data)).catch(console.error);
    brandApi.getBrands().then((res) => setBrands(res.brands)).catch(console.error);
    taxRateApi.getTaxRates().then((res) => setTaxRates(res.taxRates)).catch(console.error);
    productAttributeApi.getAttributes().then((res) => setAttributes(res.attributes)).catch(console.error);
  }, []);

  // Sync isPersonalised when productType changes
  useEffect(() => {
    if (formData.productType === 'PERSONALISED') {
      setFormData((prev) => ({
        ...prev,
        isPersonalised: true,
        badges: prev.badges?.some((b) => b.badge === 'PERSONALISED')
          ? prev.badges
          : [...(prev.badges || []), { badge: 'PERSONALISED', source: 'AUTOMATIC', active: true }],
      }));
    }
  }, [formData.productType]);

  // Handle Input Changes
  const handleChange = (field: keyof CreateProductInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Step Validation Logic
  const validateStep = (stepNumber: number): boolean => {
    const errors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.title?.trim()) errors.title = 'Product title is required';
      if (!formData.primaryCategoryId) errors.primaryCategoryId = 'Primary category is required';
    }

    if (stepNumber === 2) {
      if (formData.mrp === undefined || formData.mrp === null || isNaN(formData.mrp)) {
        errors.mrp = 'MRP is required';
      }
      if (formData.sellingPrice === undefined || formData.sellingPrice === null || isNaN(formData.sellingPrice)) {
        errors.sellingPrice = 'Selling price is required';
      }
      if (formData.mrp !== undefined && formData.sellingPrice !== undefined && formData.sellingPrice > formData.mrp) {
        errors.sellingPrice = 'Selling price cannot exceed MRP';
      }
      if (formData.costPrice !== undefined && formData.costPrice < 0) {
        errors.costPrice = 'Cost price cannot be negative';
      }
    }

    if (stepNumber === 3) {
      if (formData.manageStock && (formData.stockQuantity === undefined || formData.stockQuantity === null)) {
        errors.stockQuantity = 'Stock quantity is required when inventory management is enabled';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 1; i <= STEPS.length; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        return;
      }
    }
    await onSubmit(formData);
  };

  // Calculate Tax Preview
  const selectedTaxRateObj = taxRates.find((t) => t.id === formData.taxRateId);
  const taxRateVal = selectedTaxRateObj ? parseFloat(selectedTaxRateObj.totalRate) : 18;
  const taxPreview = calculateTax({
    price: formData.sellingPrice || 0,
    quantity: 1,
    totalRate: taxRateVal,
    cgstRate: taxRateVal / 2,
    sgstRate: taxRateVal / 2,
    igstRate: taxRateVal,
    includesTax: formData.priceIncludesTax ?? true,
    supplyType: 'INTRA_STATE',
  });

  // Toggle Badges
  const toggleBadge = (badge: ProductBadge) => {
    const current = formData.badges || [];
    const exists = current.find((b) => b.badge === badge);
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        badges: current.filter((b) => b.badge !== badge),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        badges: [...current, { badge, source: 'MANUAL', active: true }],
      }));
    }
  };

  // Preview Variations Builder
  const handleGenerateVariationsPreview = () => {
    const res = generateVariationCombinations(variationSelections, 100);
    setVariationPreview(res);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {mode === 'create' ? 'Create New Product' : `Edit Product: ${initialData?.title}`}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Jaipur Gifting Platform • Single Store Catalog
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : mode === 'create' ? 'Save Product' : 'Update Product'}
          </button>
        </div>
      </div>

      {/* Wizard Steps Navigation Bar */}
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCurrent = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (validateStep(currentStep)) {
                    setCurrentStep(step.id);
                  }
                }}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-600'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span
                    className={`p-1.5 rounded-lg ${
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">Step {step.id}</span>
                </div>
                <p className="text-xs font-semibold text-slate-900 truncate w-full">{step.title}</p>
                <p className="text-[10px] text-slate-500 truncate w-full mt-0.5">{step.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Body Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* STEP 1: Basic Info & Type */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Step 1: Product Structure & General Info
            </h2>

            {/* Product Type Selector */}
            <ProductTypeSelector
              value={formData.productType}
              onChange={(newType) => handleChange('productType', newType)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Personalised A4 Baby Birth Details Frame"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    validationErrors.title
                      ? 'border-red-300 ring-2 ring-red-100 text-red-900'
                      : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
                {validationErrors.title && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Internal Operational Name <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.internalName || ''}
                  onChange={(e) => handleChange('internalName', e.target.value)}
                  placeholder="e.g. Baby Frame A4 V2 - Workshop Code"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Primary Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.primaryCategoryId}
                  onChange={(e) => handleChange('primaryCategoryId', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    validationErrors.primaryCategoryId
                      ? 'border-red-300 ring-2 ring-red-100'
                      : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                >
                  <option value="">-- Select Primary Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {validationErrors.primaryCategoryId && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.primaryCategoryId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Brand <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={formData.brandId || ''}
                  onChange={(e) => handleChange('brandId', e.target.value || null)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Select Brand --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as ProductStatus)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="DRAFT">Draft (Unpublished)</option>
                  <option value="ACTIVE">Active (Published)</option>
                  <option value="INACTIVE">Inactive (Hidden from catalog)</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => handleChange('visibility', e.target.value as ProductVisibility)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="PUBLIC">Public (Website & Mobile App)</option>
                  <option value="APP_ONLY">App Only</option>
                  <option value="WEBSITE_ONLY">Website Only</option>
                  <option value="HIDDEN">Hidden (Direct URL link only)</option>
                  <option value="ADMIN_ONLY">Admin Internal Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">SKU Code</label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  placeholder="e.g. JPG-FRM-BABY-A4"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Barcode / EAN</label>
                <input
                  type="text"
                  value={formData.barcode || ''}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                  placeholder="e.g. 890123456701"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Short Description</label>
              <textarea
                rows={2}
                value={formData.shortDescription || ''}
                onChange={(e) => handleChange('shortDescription', e.target.value)}
                placeholder="Brief summary for product card hover and instant Jaipur checkout drawer..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Detailed Description</label>
              <textarea
                rows={4}
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Full product story, materials, craftsmanship details, dimensions..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Pricing & Tax */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Step 2: Pricing, Tax & Commercials (INR ₹)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  MRP (Maximum Retail Price ₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.mrp !== undefined ? formData.mrp : ''}
                    onChange={(e) => handleChange('mrp', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="1499.00"
                    className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                      validationErrors.mrp
                        ? 'border-red-300 ring-2 ring-red-100'
                        : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {validationErrors.mrp && <p className="text-xs text-red-600 mt-1">{validationErrors.mrp}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Selling Price (Offer Price ₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice !== undefined ? formData.sellingPrice : ''}
                    onChange={(e) =>
                      handleChange('sellingPrice', e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="999.00"
                    className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                      validationErrors.sellingPrice
                        ? 'border-red-300 ring-2 ring-red-100'
                        : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {validationErrors.sellingPrice && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.sellingPrice}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Cost Price (Internal COGS ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice !== undefined ? formData.costPrice : ''}
                    onChange={(e) =>
                      handleChange('costPrice', e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="350.00"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Discount Summary Banner */}
            {formData.mrp && formData.sellingPrice && formData.mrp > formData.sellingPrice && (
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
                <span>
                  <strong>Calculated Discount:</strong> ₹{(formData.mrp - formData.sellingPrice).toFixed(2)} off (
                  {Math.round(((formData.mrp - formData.sellingPrice) / formData.mrp) * 100)}% savings)
                </span>
                <span className="font-semibold text-indigo-700">Display Badge: Discount Active</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">GST Tax Rate</label>
                <select
                  value={formData.taxRateId || ''}
                  onChange={(e) => handleChange('taxRateId', e.target.value || null)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Select Applicable GST Rate --</option>
                  {taxRates.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.name} ({tr.totalRate}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="priceIncludesTax"
                  checked={formData.priceIncludesTax}
                  onChange={(e) => handleChange('priceIncludesTax', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded-xs focus:ring-indigo-500"
                />
                <label htmlFor="priceIncludesTax" className="text-sm font-medium text-slate-800">
                  Selling price is inclusive of GST
                </label>
              </div>
            </div>

            {/* GST Breakdown Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> GST Tax Breakdown Preview (Jaipur Intra-State)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-500">Base Amount:</span>
                  <p className="font-bold text-slate-900">₹{taxPreview.baseAmount}</p>
                </div>
                <div>
                  <span className="text-slate-500">CGST ({taxRateVal / 2}%):</span>
                  <p className="font-bold text-slate-900">₹{taxPreview.cgstAmount}</p>
                </div>
                <div>
                  <span className="text-slate-500">SGST ({taxRateVal / 2}%):</span>
                  <p className="font-bold text-slate-900">₹{taxPreview.sgstAmount}</p>
                </div>
                <div>
                  <span className="text-slate-500">Total Bill Price:</span>
                  <p className="font-bold text-emerald-700">₹{taxPreview.totalAmount}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Inventory & Delivery */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Step 3: Inventory & Instant Delivery Settings
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="manageStock"
                  checked={formData.manageStock}
                  onChange={(e) => handleChange('manageStock', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded-xs focus:ring-indigo-500"
                />
                <label htmlFor="manageStock" className="text-sm font-semibold text-slate-900">
                  Track stock quantity for this product
                </label>
              </div>

              {formData.manageStock && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-7">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.stockQuantity !== undefined ? formData.stockQuantity : ''}
                      onChange={(e) =>
                        handleChange('stockQuantity', e.target.value ? parseInt(e.target.value) : 0)
                      }
                      placeholder="10"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Low Stock Warning Limit</label>
                    <input
                      type="number"
                      value={formData.lowStockThreshold || ''}
                      onChange={(e) =>
                        handleChange('lowStockThreshold', e.target.value ? parseInt(e.target.value) : 5)
                      }
                      placeholder="5"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="allowBackorder"
                      checked={formData.allowBackorder}
                      onChange={(e) => handleChange('allowBackorder', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded-xs"
                    />
                    <label htmlFor="allowBackorder" className="text-xs font-medium text-slate-700">
                      Allow backorders when stock reaches 0
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Jaipur Delivery Speeds & Feasibility</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sameDayEligible}
                    onChange={(e) => handleChange('sameDayEligible', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded-xs"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900">90-Min / Same-Day Jaipur Delivery</span>
                    <p className="text-[11px] text-slate-500">Eligible for instant hyper-local Jaipur dispatch.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.expressEligible}
                    onChange={(e) => handleChange('expressEligible', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded-xs"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900">Express Priority Dispatch</span>
                    <p className="text-[11px] text-slate-500">Express rider priority queue allocation.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Workshop Preparation Time (Minutes)
                </label>
                <input
                  type="number"
                  value={formData.preparationTimeMinutes || ''}
                  onChange={(e) =>
                    handleChange('preparationTimeMinutes', e.target.value ? parseInt(e.target.value) : 30)
                  }
                  placeholder="30"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Packing Time (Minutes)
                </label>
                <input
                  type="number"
                  value={formData.packingTimeMinutes || ''}
                  onChange={(e) =>
                    handleChange('packingTimeMinutes', e.target.value ? parseInt(e.target.value) : 15)
                  }
                  placeholder="15"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Attributes & Variations */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Step 4: Product Attributes & Variations Foundation
            </h2>

            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Attribute Assignment & Variation Combinations
              </p>
              <p className="text-indigo-800">
                Select attribute dimensions (e.g. Colour, Size, Material) to configure variations for this product.
              </p>
            </div>

            {/* List Attributes */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Global Product Attributes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attributes.map((attr) => (
                  <div key={attr.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">{attr.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {attr.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {attr.values.map((v) => (
                        <span
                          key={v.id}
                          className="text-[11px] px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700"
                        >
                          {v.displayValue || v.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Variation Combination Builder Preview */}
            {formData.productType === 'VARIABLE' && (
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Variation Combination Generator Preview
                  </h4>
                  <button
                    type="button"
                    onClick={handleGenerateVariationsPreview}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    Generate Combinations
                  </button>
                </div>

                {variationPreview && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Total Generated: {variationPreview.totalCombinations}
                      </span>
                      {variationPreview.exceededLimit && (
                        <span className="text-amber-600 font-bold">Limit Exceeded (&gt;100)</span>
                      )}
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {variationPreview.combinations.map((c: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-[11px] p-1.5 bg-slate-50 rounded-md border border-slate-100"
                        >
                          <span className="font-semibold text-slate-800">{c.label}</span>
                          <span className="font-mono text-slate-400 text-[10px]">{c.combinationKey}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Media & Badges */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Step 5: Media Gallery & Product Badges
            </h2>

            {/* Media Gallery */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Product Media Gallery</h3>
                  <p className="text-xs text-slate-500">
                    Main product image is required for active publication. Up to 6 images allowed.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {formData.media?.length || 0} / 6 Images
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {formData.media?.map((m, idx) => (
                  <div key={idx} className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-square">
                    <img src={m.url} alt={m.altText || ''} className="w-full h-full object-cover" />
                    {m.isPrimary && (
                      <span className="absolute top-1 left-1 text-[9px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-md">
                        MAIN
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const newMedia = (formData.media || []).filter((_, i) => i !== idx);
                        setFormData((prev) => ({ ...prev, media: newMedia }));
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {(formData.media?.length || 0) < 6 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newMedia = [
                        ...(formData.media || []),
                        {
                          fileAssetId: `img-file-${Date.now()}`,
                          url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
                          isPrimary: (formData.media?.length || 0) === 0,
                          sortOrder: (formData.media?.length || 0) + 1,
                        },
                      ];
                      setFormData((prev) => ({ ...prev, media: newMedia }));
                    }}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 aspect-square text-slate-400 hover:text-indigo-600 transition-all cursor-pointer"
                  >
                    <Plus className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-semibold">Add Image</span>
                  </button>
                )}
              </div>
            </div>

            {/* Badges Selection */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Product Badges</h3>
              <p className="text-xs text-slate-500">
                Badges appear on product cards across the Jaipur catalog to highlight key selling points.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_BADGES.map((item) => {
                  const isChecked = formData.badges?.some((b) => b.badge === item.badge && b.active);
                  return (
                    <div
                      key={item.badge}
                      onClick={() => toggleBadge(item.badge)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.label}</span>
                        {isChecked && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: SEO & Search */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Step 6: SEO, Meta & Catalog Indexing
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="personalised-a4-baby-birth-details-frame"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Public URL: https://jaipurgifting.com/products/
                  <span className="font-mono text-indigo-600">{formData.slug || 'product-slug'}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">SEO Title Tag</label>
                <input
                  type="text"
                  value={formData.seoTitle || ''}
                  onChange={(e) => handleChange('seoTitle', e.target.value)}
                  placeholder="Buy Personalised Baby Birth Frame Online in Jaipur"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">SEO Meta Description</label>
                <textarea
                  rows={3}
                  value={formData.seoDescription || ''}
                  onChange={(e) => handleChange('seoDescription', e.target.value)}
                  placeholder="Order custom A4 baby birth photo frame with instant same-day delivery in Jaipur..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Step
          </button>

          <div className="flex items-center gap-3">
            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {loading ? 'Saving Product...' : mode === 'create' ? 'Complete & Save Product' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
