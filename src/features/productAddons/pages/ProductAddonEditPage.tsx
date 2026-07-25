import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Gift, DollarSign, Layers, ShieldCheck, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { useProductAddonDetail, useUpdateProductAddon } from '../hooks/useProductAddons';
import { ProductAddonInputType, ProductAddonPricingType, AddonAssignmentType } from '../types/productAddon';

export function ProductAddonEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: addon, isLoading } = useProductAddonDetail(id);
  const updateAddon = useUpdateProductAddon();

  // Form States
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [code, setCode] = useState('');
  const [customerLabel, setCustomerLabel] = useState('');
  const [internalLabel, setInternalLabel] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [inputType, setInputType] = useState<ProductAddonInputType>('CHECKBOX');
  const [pricingType, setPricingType] = useState<ProductAddonPricingType>('FIXED');
  const [fixedPrice, setFixedPrice] = useState('49.00');
  const [percentageRate, setPercentageRate] = useState('10.00');
  const [minimumAmount, setMinimumAmount] = useState('10.00');
  const [maximumAmount, setMaximumAmount] = useState('500.00');
  const [priceIncludesTax, setPriceIncludesTax] = useState(true);
  const [status, setStatus] = useState('ACTIVE');
  const [isRequired, setIsRequired] = useState(false);
  const [allowQuantity, setAllowQuantity] = useState(false);
  const [minimumQuantity, setMinimumQuantity] = useState(1);
  const [manageStock, setManageStock] = useState(false);
  const [stockQuantity, setStockQuantity] = useState('100');
  const [options, setOptions] = useState<Array<{ name: string; code: string; fixedPrice: string; isDefault: boolean }>>([]);
  const [assignmentType, setAssignmentType] = useState<AddonAssignmentType>('GLOBAL');

  useEffect(() => {
    if (addon) {
      setName(addon.name || '');
      setSlug(addon.slug || '');
      setCode(addon.code || '');
      setCustomerLabel(addon.customerLabel || '');
      setInternalLabel(addon.internalLabel || '');
      setShortDescription(addon.shortDescription || '');
      setDescription(addon.description || '');
      setInputType(addon.inputType);
      setPricingType(addon.pricingType);
      setFixedPrice(String(addon.fixedPrice || '0.00'));
      setPercentageRate(String(addon.percentageRate || '0.00'));
      setMinimumAmount(String(addon.minimumAmount || '0.00'));
      setMaximumAmount(String(addon.maximumAmount || '0.00'));
      setPriceIncludesTax(addon.priceIncludesTax);
      setStatus(addon.status);
      setIsRequired(addon.isRequired);
      setAllowQuantity(addon.allowQuantity);
      setMinimumQuantity(addon.minimumQuantity || 1);
      setManageStock(addon.manageStock);
      setStockQuantity(String(addon.stockQuantity || '0'));
      setOptions(
        addon.options?.map((o) => ({
          name: o.name,
          code: o.code || '',
          fixedPrice: String(o.fixedPrice || '0.00'),
          isDefault: o.isDefault,
        })) || []
      );
      if (addon.assignments && addon.assignments.length > 0) {
        setAssignmentType(addon.assignments[0].assignmentType);
      }
    }
  }, [addon]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Loading add-on for editing...</p>
      </div>
    );
  }

  if (!addon) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p className="text-base font-semibold text-slate-800">Product Add-on not found</p>
        <Link to="/admin/product-addons" className="text-xs text-indigo-600 font-medium hover:underline mt-2 inline-block">
          Return to Add-ons List
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      name,
      slug,
      code: code || null,
      customerLabel: customerLabel || name,
      internalLabel: internalLabel || name,
      shortDescription: shortDescription || null,
      description: description || null,
      inputType,
      pricingType,
      fixedPrice: ['FIXED', 'PER_QUANTITY'].includes(pricingType) ? fixedPrice : null,
      percentageRate: pricingType === 'PERCENTAGE' ? percentageRate : null,
      minimumAmount: pricingType === 'CUSTOM_AMOUNT' ? minimumAmount : null,
      maximumAmount: pricingType === 'CUSTOM_AMOUNT' ? maximumAmount : null,
      priceIncludesTax,
      status,
      isRequired,
      allowQuantity,
      minimumQuantity: allowQuantity ? minimumQuantity : 0,
      manageStock,
      stockQuantity: manageStock ? Number(stockQuantity) : null,
      options: ['RADIO', 'DROPDOWN'].includes(inputType) ? options : [],
      assignments: [{ assignmentType, sortOrder: 1, status: 'ACTIVE' }],
    };

    updateAddon.mutate(
      { id: addon.id, data: payload },
      {
        onSuccess: () => {
          navigate('/admin/product-addons');
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={`Edit Add-on: ${addon.name}`}
        description="Update settings, pricing rules, choice options, and catalog target assignments."
        actions={
          <Link
            to="/admin/product-addons"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-semibold text-base">
            <Gift className="h-5 w-5 text-indigo-600" />
            <span>1. Basic Details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Add-on Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Add-on Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Label</label>
              <input
                type="text"
                value={customerLabel}
                onChange={(e) => setCustomerLabel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing Engine */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-semibold text-base">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <span>2. Pricing Engine</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pricing Model *</label>
              <select
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="FIXED">Fixed Amount</option>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FREE">Free</option>
                <option value="PER_QUANTITY">Per Quantity Unit</option>
                <option value="CUSTOM_AMOUNT">Custom Amount</option>
              </select>
            </div>

            {['FIXED', 'PER_QUANTITY'].includes(pricingType) && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fixed Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={fixedPrice}
                  onChange={(e) => setFixedPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/product-addons"
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateAddon.isPending}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {updateAddon.isPending ? 'Updating...' : 'Update Product Add-on'}
          </button>
        </div>
      </form>
    </div>
  );
}
