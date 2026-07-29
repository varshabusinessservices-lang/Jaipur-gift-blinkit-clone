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
import { productApi } from '../services/productApi';
import { config } from '../../../config/env';
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
  X,
  Settings,
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

  // Real variations state
  const [productVariations, setProductVariations] = useState<any[]>([]);
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [savingVariations, setSavingVariations] = useState(false);

  // Custom Attribute Form State
  const [showCustomAttrForm, setShowCustomAttrForm] = useState(false);
  const [customAttrName, setCustomAttrName] = useState('');
  const [customAttrType, setCustomAttrType] = useState('BUTTON');
  const [customAttrValuesStr, setCustomAttrValuesStr] = useState('');
  const [creatingCustomAttr, setCreatingCustomAttr] = useState(false);

  // Manual single variation addition form state
  const [manualVariationSelections, setManualVariationSelections] = useState<Record<string, string>>({});
  const [manualSku, setManualSku] = useState('');
  const [manualMrp, setManualMrp] = useState<number | undefined>(undefined);
  const [manualSellingPrice, setManualSellingPrice] = useState<number | undefined>(undefined);
  const [manualStock, setManualStock] = useState<number>(10);
  const [addingManualVariation, setAddingManualVariation] = useState(false);

  // Image upload states
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load product variations in Edit Mode
  useEffect(() => {
    if (mode === 'edit' && initialData?.id) {
      setLoadingVariations(true);
      productApi.listVariations(initialData.id)
        .then(res => {
          if (res.success) {
            setProductVariations(res.data || []);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingVariations(false));
    }
  }, [mode, initialData?.id]);

  // Attribute Handlers
  const toggleAttributeAssignment = (attributeId: string) => {
    const isAssigned = formData.attributeAssignments?.some(a => a.attributeId === attributeId);
    if (isAssigned) {
      setFormData(prev => ({
        ...prev,
        attributeAssignments: (prev.attributeAssignments || []).filter(a => a.attributeId !== attributeId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        attributeAssignments: [
          ...(prev.attributeAssignments || []),
          {
            attributeId,
            isRequired: false,
            isVariationAttribute: false,
            isFilterable: true,
            sortOrder: (prev.attributeAssignments?.length || 0) + 1,
            valueIds: [],
          }
        ]
      }));
    }
  };

  const toggleAttributeValue = (attributeId: string, valueId: string) => {
    setFormData(prev => {
      const assignments = [...(prev.attributeAssignments || [])];
      const idx = assignments.findIndex(a => a.attributeId === attributeId);
      if (idx === -1) return prev;

      const assignment = { ...assignments[idx] };
      const valueIds = [...assignment.valueIds];
      const valIdx = valueIds.indexOf(valueId);
      if (valIdx > -1) {
        valueIds.splice(valIdx, 1);
      } else {
        valueIds.push(valueId);
      }
      assignment.valueIds = valueIds;
      assignments[idx] = assignment;
      return { ...prev, attributeAssignments: assignments };
    });
  };

  const updateAssignmentSetting = (attributeId: string, key: 'isRequired' | 'isVariationAttribute' | 'isFilterable', value: boolean) => {
    setFormData(prev => {
      const assignments = (prev.attributeAssignments || []).map(a => {
        if (a.attributeId === attributeId) {
          return { ...a, [key]: value };
        }
        return a;
      });
      return { ...prev, attributeAssignments: assignments };
    });
  };

  const handleCreateCustomAttribute = async () => {
    if (!customAttrName.trim()) {
      alert('Please enter an attribute name');
      return;
    }
    const values = customAttrValuesStr.split(',')
      .map(v => v.trim())
      .filter(Boolean)
      .map((v, i) => ({
        name: v,
        slug: v.toLowerCase().replace(/\s+/g, '-'),
        displayValue: v,
        sortOrder: i + 1,
        status: 'ACTIVE' as const,
      }));

    if (values.length === 0) {
      alert('Please enter at least one attribute value');
      return;
    }

    setCreatingCustomAttr(true);
    try {
      const newAttr = await productAttributeApi.createAttribute({
        name: customAttrName,
        type: customAttrType as any,
        values,
        status: 'ACTIVE',
        sortOrder: attributes.length + 1,
        allowMultipleValues: true,
      });

      setAttributes(prev => [...prev, newAttr]);
      
      setFormData(prev => ({
        ...prev,
        attributeAssignments: [
          ...(prev.attributeAssignments || []),
          {
            attributeId: newAttr.id,
            isRequired: false,
            isVariationAttribute: false,
            isFilterable: true,
            sortOrder: (prev.attributeAssignments?.length || 0) + 1,
            valueIds: newAttr.values.map(v => v.id),
          }
        ]
      }));

      setShowCustomAttrForm(false);
      setCustomAttrName('');
      setCustomAttrType('BUTTON');
      setCustomAttrValuesStr('');
    } catch (error: any) {
      console.error('Error creating attribute:', error);
      alert('Failed to create custom attribute: ' + (error.message || 'Unknown error'));
    } finally {
      setCreatingCustomAttr(false);
    }
  };

  const buildSelectionsFromFormData = (): AttributeSelectionInput[] => {
    const selections: AttributeSelectionInput[] = [];
    const assignments = formData.attributeAssignments || [];

    for (const assign of assignments) {
      if (!assign.isVariationAttribute) continue;

      const attr = attributes.find(a => a.id === assign.attributeId);
      if (!attr) continue;

      const selectedVals = attr.values
        .filter(v => assign.valueIds.includes(v.id))
        .map(v => ({
          id: v.id,
          name: v.displayValue || v.name,
          status: v.status || 'ACTIVE'
        }));

      if (selectedVals.length > 0) {
        selections.push({
          attributeId: attr.id,
          attributeName: attr.name,
          values: selectedVals
        });
      }
    }

    return selections;
  };

  // Real Combination Generator via API
  const handleGenerateVariationsReal = async () => {
    if (!initialData?.id) {
      alert('Product ID not found. Please save the basic product first.');
      return;
    }
    const selections = buildSelectionsFromFormData();
    if (selections.length === 0) {
      alert('Please select at least one variation attribute and value first.');
      return;
    }

    const previewRes = generateVariationCombinations(selections, 100);
    if (!previewRes.success || previewRes.combinations.length === 0) {
      alert(previewRes.warningMessage || 'No combinations could be generated.');
      return;
    }

    setSavingVariations(true);
    try {
      const combinationsPayload = previewRes.combinations.map((c: any) => ({
        combinationKey: c.combinationKey,
        title: `${formData.title} - ${c.label}`,
        attributeValues: c.attributeValues.map((av: any) => ({
          attributeId: av.attributeId,
          attributeValueId: av.valueId,
        })),
        mrp: formData.mrp || 0,
        sellingPrice: formData.sellingPrice || 0,
        costPrice: formData.costPrice || 0,
        stockQuantity: formData.stockQuantity || 0,
        status: 'ACTIVE' as const,
      }));

      await productApi.generateVariations(initialData.id, {
        combinations: combinationsPayload,
        skipExisting: true,
        activateNew: true,
      });

      // Reload variations
      const updated = await productApi.listVariations(initialData.id);
      if (updated.success) {
        setProductVariations(updated.data || []);
      }
      alert('Variations generated and saved successfully!');
    } catch (error: any) {
      console.error('Error generating variations:', error);
      alert(error.message || 'Failed to generate variations.');
    } finally {
      setSavingVariations(false);
    }
  };

  const handleBulkSaveVariations = async () => {
    if (!initialData?.id) return;
    setSavingVariations(true);
    try {
      const payload = productVariations.map(v => ({
        id: v.id,
        sku: v.sku,
        mrp: parseFloat(v.mrp) || 0,
        sellingPrice: parseFloat(v.sellingPrice) || 0,
        costPrice: parseFloat(v.costPrice) || 0,
        stockQuantity: parseInt(v.stockQuantity) || 0,
        status: v.status,
        isDefault: v.isDefault || false,
      }));

      await productApi.bulkUpdateVariations(initialData.id, { variations: payload });
      alert('All variations updated successfully!');
    } catch (error: any) {
      console.error('Error bulk updating variations:', error);
      alert(error.message || 'Failed to bulk update variations.');
    } finally {
      setSavingVariations(false);
    }
  };

  const handleCreateManualVariation = async () => {
    if (!initialData?.id) return;
    const variationAttrs = (formData.attributeAssignments || []).filter(a => a.isVariationAttribute);
    
    // Check if a value is selected for each variation attribute
    const attributeValues: any[] = [];
    for (const assign of variationAttrs) {
      const selectedValueId = manualVariationSelections[assign.attributeId];
      if (!selectedValueId) {
        const attr = attributes.find(a => a.id === assign.attributeId);
        alert(`Please select a value for attribute: ${attr?.name || 'Unknown'}`);
        return;
      }
      attributeValues.push({
        attributeId: assign.attributeId,
        attributeValueId: selectedValueId,
      });
    }

    if (attributeValues.length === 0) {
      alert('No variation attributes configured. Set at least one attribute to "Use for Variations" first.');
      return;
    }

    // Sort to build unique key for duplicate check
    const sortedPairs = [...attributeValues].sort((a, b) => a.attributeId.localeCompare(b.attributeId));
    const combinationKey = sortedPairs.map(p => `${p.attributeId}:${p.attributeValueId}`).join('|');

    // Duplicate Check
    const exists = productVariations.some(v => {
      return v.combinationKey === combinationKey;
    });

    if (exists) {
      alert('Duplicate Variation: A variation with this exact combination already exists.');
      return;
    }

    setAddingManualVariation(true);
    try {
      const labelParts: string[] = [];
      for (const pair of sortedPairs) {
        const attr = attributes.find(a => a.id === pair.attributeId);
        const valObj = attr?.values.find(v => v.id === pair.attributeValueId);
        labelParts.push(valObj?.displayValue || valObj?.name || '');
      }
      const label = labelParts.join(' / ');

      await productApi.createVariation(initialData.id, {
        combinationKey,
        title: `${formData.title} - ${label}`,
        sku: manualSku || null,
        mrp: manualMrp || formData.mrp || 0,
        sellingPrice: manualSellingPrice || formData.sellingPrice || 0,
        costPrice: formData.costPrice || 0,
        stockQuantity: manualStock,
        status: 'ACTIVE',
        isDefault: productVariations.length === 0,
        attributeValues,
      });

      // Reload variations
      const updated = await productApi.listVariations(initialData.id);
      if (updated.success) {
        setProductVariations(updated.data || []);
      }
      
      // Reset manual fields
      setManualSku('');
      setManualMrp(undefined);
      setManualSellingPrice(undefined);
      setManualStock(10);
      alert('Manual variation created successfully!');
    } catch (error: any) {
      console.error('Error creating manual variation:', error);
      alert(error.message || 'Failed to create manual variation.');
    } finally {
      setAddingManualVariation(false);
    }
  };

  const handleDeleteVariation = async (variationId: string) => {
    if (!initialData?.id) return;
    if (!confirm('Are you sure you want to delete this variation?')) return;

    try {
      await productApi.deleteVariation(initialData.id, variationId);
      setProductVariations(prev => prev.filter(v => v.id !== variationId));
    } catch (error: any) {
      console.error('Error deleting variation:', error);
      alert(error.message || 'Failed to delete variation');
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const file = files[0];
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('role', 'PRODUCT_IMAGE');

      const res = await fetch(`${config.apiBaseUrl}/admin/products/media`, {
        method: 'POST',
        body: formDataUpload,
      });

      if (!res.ok) {
        throw new Error('Failed to upload image');
      }

      const responseJson = await res.json();
      const uploadedAsset = responseJson.data;

      const newMedia = [
        ...(formData.media || []),
        {
          fileAssetId: uploadedAsset.fileAssetId,
          url: uploadedAsset.url,
          isPrimary: (formData.media?.length || 0) === 0,
          sortOrder: (formData.media?.length || 0) + 1,
        },
      ];
      setFormData((prev) => ({ ...prev, media: newMedia }));
    } catch (err) {
      console.error('Error uploading product media:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                Step 4: Product Attributes & Variations Foundation
              </h2>
              <button
                type="button"
                onClick={() => setShowCustomAttrForm(true)}
                className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Custom Attribute
              </button>
            </div>

            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Attribute Assignment & Variation Combinations
              </p>
              <p className="text-indigo-800">
                Select attribute dimensions (e.g. Colour, Size, Material) to configure variations for this product. You can toggle attribute settings, select values, and create custom values.
              </p>
            </div>

            {/* Custom Attribute Creation Modal / Form */}
            {showCustomAttrForm && (
              <div className="p-4 border border-indigo-200 rounded-xl bg-indigo-50/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    New Custom Attribute
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowCustomAttrForm(false)}
                    className="p-1 hover:bg-indigo-100 rounded text-indigo-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Attribute Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sleeve Type"
                      value={customAttrName}
                      onChange={(e) => setCustomAttrName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Display Type
                    </label>
                    <select
                      value={customAttrType}
                      onChange={(e) => setCustomAttrType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="BUTTON">Chips / Buttons</option>
                      <option value="COLOUR">Color Circles</option>
                      <option value="SELECT">Dropdown Menu</option>
                      <option value="TEXT">Text Field</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Attribute Values (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Short Sleeve, Full Sleeve, Sleeveless"
                    value={customAttrValuesStr}
                    onChange={(e) => setCustomAttrValuesStr(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Enter values separated by commas. Each value will be added automatically.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomAttrForm(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={creatingCustomAttr}
                    onClick={handleCreateCustomAttribute}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                  >
                    {creatingCustomAttr ? 'Creating...' : 'Save & Assign'}
                  </button>
                </div>
              </div>
            )}

            {/* List Attributes */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Manage Product Attributes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attributes.map((attr) => {
                  const assignment = (formData.attributeAssignments || []).find(
                    (a) => a.attributeId === attr.id
                  );
                  const isAssigned = !!assignment;

                  return (
                    <div
                      key={attr.id}
                      className={`p-4 border rounded-xl transition-all ${
                        isAssigned
                          ? 'border-indigo-200 bg-white shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          {isAssigned ? (
                            <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300" />
                          )}
                          <span className="text-xs font-bold text-slate-900">{attr.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {attr.type}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleAttributeAssignment(attr.id)}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors border ${
                              isAssigned
                                ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
                            }`}
                          >
                            {isAssigned ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>

                      {isAssigned && (
                        <div className="space-y-3 mt-3">
                          {/* Attribute Settings checkboxes */}
                          <div className="flex flex-wrap items-center gap-4 py-1.5 border-b border-slate-50 text-[11px] text-slate-600">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assignment.isRequired || false}
                                onChange={(e) =>
                                  updateAssignmentSetting(attr.id, 'isRequired', e.target.checked)
                                }
                                className="rounded text-indigo-600 border-slate-300 w-3.5 h-3.5"
                              />
                              Required
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assignment.isVariationAttribute || false}
                                onChange={(e) =>
                                  updateAssignmentSetting(attr.id, 'isVariationAttribute', e.target.checked)
                                }
                                className="rounded text-indigo-600 border-slate-300 w-3.5 h-3.5"
                              />
                              <span className="font-semibold text-indigo-600">Use for Variations</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assignment.isFilterable ?? true}
                                onChange={(e) =>
                                  updateAssignmentSetting(attr.id, 'isFilterable', e.target.checked)
                                }
                                className="rounded text-indigo-600 border-slate-300 w-3.5 h-3.5"
                              />
                              Filterable
                            </label>
                          </div>

                          {/* Attribute Value Selection badges */}
                          <div>
                            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                              Select Active Values for this Product:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {attr.values.map((v) => {
                                const selected = assignment.valueIds.includes(v.id);
                                return (
                                  <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => toggleAttributeValue(attr.id, v.id)}
                                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                                      selected
                                        ? 'bg-indigo-600 text-white border-transparent shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                  >
                                    {v.displayValue || v.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {!isAssigned && (
                        <div className="text-center py-4 text-xs text-slate-400">
                          Activate to assign this attribute dimension.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Variation Combination Builder Preview */}
            {formData.productType === 'VARIABLE' && (
              <div className="mt-8 space-y-6">
                <h3 className="text-sm font-bold text-slate-900 border-t border-slate-100 pt-6">
                  Manage Product Variations
                </h3>

                {mode === 'edit' ? (
                  <div className="space-y-6">
                    {/* Generators Panel */}
                    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Cartesian Combination Generator
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Automatically create all possible unique variation permutations based on active variation attribute selections above.
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={savingVariations}
                          onClick={handleGenerateVariationsReal}
                          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
                        >
                          {savingVariations ? 'Generating...' : 'Generate Combinations'}
                        </button>
                      </div>
                    </div>

                    {/* Manual Variation Section */}
                    <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                          Create Custom Single Variation Manually
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Manually define a custom combination variation. Duplicate combinations are automatically blocked.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Select value for each active variation attribute */}
                        {(formData.attributeAssignments || [])
                          .filter((a) => a.isVariationAttribute)
                          .map((assign) => {
                            const attr = attributes.find((at) => at.id === assign.attributeId);
                            if (!attr) return null;
                            return (
                              <div key={assign.attributeId}>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                  {attr.name}
                                </label>
                                <select
                                  value={manualVariationSelections[assign.attributeId] || ''}
                                  onChange={(e) =>
                                    setManualVariationSelections((prev) => ({
                                      ...prev,
                                      [assign.attributeId]: e.target.value,
                                    }))
                                  }
                                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                                >
                                  <option value="">Select...</option>
                                  {attr.values
                                    .filter((val) => assign.valueIds.includes(val.id))
                                    .map((val) => (
                                      <option key={val.id} value={val.id}>
                                        {val.displayValue || val.name}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            );
                          })}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            SKU (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="SKU Code"
                            value={manualSku}
                            onChange={(e) => setManualSku(e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            MRP (INR)
                          </label>
                          <input
                            type="number"
                            placeholder={String(formData.mrp || '')}
                            value={manualMrp === undefined ? '' : manualMrp}
                            onChange={(e) =>
                              setManualMrp(e.target.value === '' ? undefined : Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Selling Price (INR)
                          </label>
                          <input
                            type="number"
                            placeholder={String(formData.sellingPrice || '')}
                            value={manualSellingPrice === undefined ? '' : manualSellingPrice}
                            onChange={(e) =>
                              setManualSellingPrice(
                                e.target.value === '' ? undefined : Number(e.target.value)
                              )
                            }
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            value={manualStock}
                            onChange={(e) => setManualStock(Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          disabled={addingManualVariation}
                          onClick={handleCreateManualVariation}
                          className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1 transition-colors"
                        >
                          {addingManualVariation ? 'Adding...' : 'Add Variation'}
                        </button>
                      </div>
                    </div>

                    {/* Existing Variations Table */}
                    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
                      <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Active Variations List ({productVariations.length})
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Edit details inline, select default product variation, or delete obsolete ones.
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={savingVariations}
                          onClick={handleBulkSaveVariations}
                          className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          {savingVariations ? 'Saving...' : 'Bulk Save Variations'}
                        </button>
                      </div>

                      {loadingVariations ? (
                        <div className="p-8 text-center text-xs text-slate-400">
                          Loading active variations...
                        </div>
                      ) : productVariations.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400">
                          No active variations created yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                              <tr>
                                <th className="p-3">Variation</th>
                                <th className="p-3 w-40">SKU</th>
                                <th className="p-3 w-28">MRP (₹)</th>
                                <th className="p-3 w-28">Selling (₹)</th>
                                <th className="p-3 w-24">Stock</th>
                                <th className="p-3 w-32">Status</th>
                                <th className="p-3 text-center w-20">Default</th>
                                <th className="p-3 text-center w-12">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {productVariations.map((v, idx) => (
                                <tr key={v.id} className="hover:bg-slate-50/30">
                                  <td className="p-3 font-semibold text-slate-900">
                                    {v.title.replace(`${formData.title} - `, '')}
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      value={v.sku || ''}
                                      onChange={(e) => {
                                        const next = [...productVariations];
                                        next[idx].sku = e.target.value;
                                        setProductVariations(next);
                                      }}
                                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                                    />
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="number"
                                      value={v.mrp || ''}
                                      onChange={(e) => {
                                        const next = [...productVariations];
                                        next[idx].mrp = e.target.value;
                                        setProductVariations(next);
                                      }}
                                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-medium"
                                    />
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="number"
                                      value={v.sellingPrice || ''}
                                      onChange={(e) => {
                                        const next = [...productVariations];
                                        next[idx].sellingPrice = e.target.value;
                                        setProductVariations(next);
                                      }}
                                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-semibold text-slate-900"
                                    />
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="number"
                                      value={v.stockQuantity ?? ''}
                                      onChange={(e) => {
                                        const next = [...productVariations];
                                        next[idx].stockQuantity = e.target.value;
                                        setProductVariations(next);
                                      }}
                                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                                    />
                                  </td>
                                  <td className="p-3">
                                    <select
                                      value={v.status || 'ACTIVE'}
                                      onChange={(e) => {
                                        const next = [...productVariations];
                                        next[idx].status = e.target.value;
                                        setProductVariations(next);
                                      }}
                                      className="w-full px-1.5 py-1 border border-slate-200 rounded text-xs"
                                    >
                                      <option value="ACTIVE">Active</option>
                                      <option value="INACTIVE">Inactive</option>
                                      <option value="OUT_OF_STOCK">Out Of Stock</option>
                                    </select>
                                  </td>
                                  <td className="p-3 text-center">
                                    <input
                                      type="radio"
                                      name="defaultVariation"
                                      checked={v.isDefault || false}
                                      onChange={() => {
                                        const next = productVariations.map((vItem, i) => ({
                                          ...vItem,
                                          isDefault: i === idx,
                                        }));
                                        setProductVariations(next);
                                      }}
                                      className="rounded-full text-indigo-600 border-slate-300 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                    />
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteVariation(v.id)}
                                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-5 border border-amber-100 rounded-xl bg-amber-50/50 text-xs text-amber-900 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Save Product to Generate Variations</p>
                      <p className="text-amber-800 mt-1 leading-relaxed">
                        To guarantee structural data safety, you can generate, bulk edit, and manually add custom variations as soon as you save this new product. After creation, you will be automatically redirected back here to manage your variations database in real-time.
                      </p>
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
                  <div className="aspect-square">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleProductImageUpload}
                      accept="image/*"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 aspect-square text-slate-400 hover:text-indigo-600 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-1" />
                      ) : (
                        <Plus className="w-5 h-5 mb-1" />
                      )}
                      <span className="text-[10px] font-semibold">
                        {uploadingImage ? 'Uploading...' : 'Add Image'}
                      </span>
                    </button>
                  </div>
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
