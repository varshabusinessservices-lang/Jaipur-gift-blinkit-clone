import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Gift, DollarSign, Layers, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { useCreateProductAddon } from '../hooks/useProductAddons';
import { ProductAddonInputType, ProductAddonPricingType, AddonAssignmentType } from '../types/productAddon';

export function ProductAddonCreatePage() {
  const navigate = useNavigate();
  const createAddon = useCreateProductAddon();

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
  const [defaultAmount, setDefaultAmount] = useState('50.00');
  const [priceIncludesTax, setPriceIncludesTax] = useState(true);
  const [status, setStatus] = useState('ACTIVE');
  const [isRequired, setIsRequired] = useState(false);
  const [allowQuantity, setAllowQuantity] = useState(false);
  const [minimumQuantity, setMinimumQuantity] = useState(1);
  const [maximumQuantity, setMaximumQuantity] = useState(10);
  const [defaultQuantity, setDefaultQuantity] = useState(1);
  const [placeholder, setPlaceholder] = useState('');
  const [helpText, setHelpText] = useState('');

  // Stock
  const [manageStock, setManageStock] = useState(false);
  const [stockQuantity, setStockQuantity] = useState('100');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [allowBackorder, setAllowBackorder] = useState(false);

  // Options Array (for Radio/Dropdown)
  const [options, setOptions] = useState<Array<{ name: string; code: string; fixedPrice: string; isDefault: boolean }>>([
    { name: 'Option 1', code: 'OPT-1', fixedPrice: '29.00', isDefault: true },
    { name: 'Option 2', code: 'OPT-2', fixedPrice: '29.00', isDefault: false },
  ]);

  // Assignment Target
  const [assignmentType, setAssignmentType] = useState<AddonAssignmentType>('GLOBAL');

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  const addOptionRow = () => {
    setOptions((prev) => [
      ...prev,
      { name: `Option ${prev.length + 1}`, code: `OPT-${prev.length + 1}`, fixedPrice: fixedPrice || '0.00', isDefault: false },
    ]);
  };

  const removeOptionRow = (idx: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

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
      defaultAmount: pricingType === 'CUSTOM_AMOUNT' ? defaultAmount : null,
      priceIncludesTax,
      status,
      isRequired,
      allowQuantity,
      minimumQuantity: allowQuantity ? minimumQuantity : 0,
      maximumQuantity: allowQuantity ? maximumQuantity : null,
      defaultQuantity: allowQuantity ? defaultQuantity : null,
      placeholder: placeholder || null,
      helpText: helpText || null,
      manageStock,
      stockQuantity: manageStock ? Number(stockQuantity) : null,
      lowStockThreshold: manageStock ? Number(lowStockThreshold) : null,
      allowBackorder: manageStock ? allowBackorder : false,
      options: ['RADIO', 'DROPDOWN'].includes(inputType) ? options : [],
      assignments: [{ assignmentType, sortOrder: 1, status: 'ACTIVE' }],
    };

    createAddon.mutate(payload, {
      onSuccess: () => {
        navigate('/admin/product-addons');
      },
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Create Product Add-on"
        description="Configure new reusable add-on, gift packing, custom note, or design service."
        actions={
          <Link
            to="/admin/product-addons"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
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
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Gift Packing, Red Rose, Photo Retouching"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Add-on SKU / Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. ADD-GP-01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Front-facing Label</label>
              <input
                type="text"
                value={customerLabel}
                onChange={(e) => setCustomerLabel(e.target.value)}
                placeholder="e.g. Add Standard Gift Packing (₹49)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Input Interface Type *</label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="CHECKBOX">Checkbox (Single toggle add-on)</option>
                <option value="RADIO">Radio Buttons (Multiple choices)</option>
                <option value="DROPDOWN">Dropdown Selector (Multiple choices)</option>
                <option value="QUANTITY">Quantity Stepper (e.g. number of roses)</option>
                <option value="TEXT">Short Text Field (e.g. name to engrave)</option>
                <option value="TEXTAREA">Textarea Box (e.g. full greeting message)</option>
                <option value="SINGLE_IMAGE">Single Photo Upload</option>
                <option value="NUMBER">Custom Number / Tip Input</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="ACTIVE">Active (Live on products)</option>
                <option value="INACTIVE">Inactive (Hidden)</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief summary shown right below the title"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="FIXED">Fixed Amount (e.g., ₹49.00)</option>
                <option value="PERCENTAGE">Percentage of Base Product Price (%)</option>
                <option value="FREE">Free (₹0.00)</option>
                <option value="PER_QUANTITY">Per Quantity Unit (e.g., ₹30 per item)</option>
                <option value="CUSTOM_AMOUNT">Custom Amount (Customer inputs value)</option>
              </select>
            </div>

            {['FIXED', 'PER_QUANTITY'].includes(pricingType) && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fixed Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={fixedPrice}
                  onChange={(e) => setFixedPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>
            )}

            {pricingType === 'PERCENTAGE' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Percentage Rate (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  value={percentageRate}
                  onChange={(e) => setPercentageRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-semibold text-indigo-700"
                />
              </div>
            )}

            {pricingType === 'CUSTOM_AMOUNT' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Custom Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minimumAmount}
                    onChange={(e) => setMinimumAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Custom Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={maximumAmount}
                    onChange={(e) => setMaximumAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="taxToggle"
              checked={priceIncludesTax}
              onChange={(e) => setPriceIncludesTax(e.target.checked)}
              className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label htmlFor="taxToggle" className="text-xs text-slate-700 font-medium cursor-pointer">
              Listed add-on prices include GST/Tax by default
            </label>
          </div>
        </div>

        {/* Section 3: Radio/Dropdown Options Builder */}
        {['RADIO', 'DROPDOWN'].includes(inputType) && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
                <Layers className="h-5 w-5 text-purple-600" />
                <span>3. Configure Choice Options</span>
              </div>
              <button
                type="button"
                onClick={addOptionRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Option Choice
              </button>
            </div>

            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-xs font-bold text-slate-400 w-6">#{idx + 1}</span>
                  <input
                    type="text"
                    required
                    placeholder="Option Name (e.g. Birthday Card)"
                    value={opt.name}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[idx].name = e.target.value;
                      setOptions(updated);
                    }}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Option Code"
                    value={opt.code}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[idx].code = e.target.value;
                      setOptions(updated);
                    }}
                    className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price (₹)"
                    value={opt.fixedPrice}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[idx].fixedPrice = e.target.value;
                      setOptions(updated);
                    }}
                    className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-semibold focus:outline-none focus:border-indigo-500"
                  />
                  <label className="flex items-center gap-1 text-xs text-slate-600 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="defaultOption"
                      checked={opt.isDefault}
                      onChange={() => {
                        const updated = options.map((o, i) => ({ ...o, isDefault: i === idx }));
                        setOptions(updated);
                      }}
                    />
                    Default
                  </label>
                  <button
                    type="button"
                    onClick={() => removeOptionRow(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Assignment Target */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-semibold text-base">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <span>4. Catalog Target Assignment</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Assign Add-on To *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 'GLOBAL', label: 'Global (All Catalog Products)', desc: 'Applies automatically to every product' },
                { id: 'ALL_PERSONALISED_PRODUCTS', label: 'All Personalised Products', desc: 'Applies to custom photo/text gift items' },
                { id: 'CATEGORY', label: 'Category Level', desc: 'Applies to all products under selected categories' },
                { id: 'PRODUCT', label: 'Specific Product / Variation', desc: 'Applies only to explicitly assigned products' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setAssignmentType(item.id as any)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    assignmentType === item.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      checked={assignmentType === item.id}
                      onChange={() => setAssignmentType(item.id as any)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-900">{item.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
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
            disabled={createAddon.isPending}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {createAddon.isPending ? 'Saving Add-on...' : 'Save Product Add-on'}
          </button>
        </div>
      </form>
    </div>
  );
}
