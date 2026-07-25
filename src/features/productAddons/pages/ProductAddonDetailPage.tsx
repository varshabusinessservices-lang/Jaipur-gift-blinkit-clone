import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, Copy, Gift, ShieldCheck, DollarSign, Layers, CheckCircle2,
  HelpCircle, RefreshCw, Sparkles, Calculator
} from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useProductAddonDetail, useDeleteProductAddon, useDuplicateProductAddon } from '../hooks/useProductAddons';

export function ProductAddonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: addon, isLoading } = useProductAddonDetail(id);
  const deleteAddon = useDeleteProductAddon();
  const duplicateAddon = useDuplicateProductAddon();

  // Interactive Live Preview State
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [customAmountInput, setCustomAmountInput] = useState<string>('50');
  const [textInput, setTextInput] = useState<string>('Happy Birthday Love!');
  const [isChecked, setIsChecked] = useState<boolean>(true);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Loading add-on details...</p>
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

  // Calculate Live Preview Add-on Amount
  const computeLivePrice = () => {
    let unitPrice = 0;
    if (addon.pricingType === 'FREE') unitPrice = 0;
    else if (addon.pricingType === 'FIXED') {
      if (['RADIO', 'DROPDOWN'].includes(addon.inputType) && addon.options && addon.options.length > 0) {
        const selectedOpt = addon.options.find((o) => o.id === selectedOptionId) || addon.options[0];
        unitPrice = Number(selectedOpt?.fixedPrice || addon.fixedPrice || 0);
      } else {
        unitPrice = Number(addon.fixedPrice || 0);
      }
    } else if (addon.pricingType === 'PER_QUANTITY') {
      unitPrice = Number(addon.fixedPrice || 0);
    } else if (addon.pricingType === 'PERCENTAGE') {
      const sampleProductBase = 1000; // Sample ₹1000 product
      unitPrice = (sampleProductBase * Number(addon.percentageRate || 0)) / 100;
    } else if (addon.pricingType === 'CUSTOM_AMOUNT') {
      unitPrice = Math.max(Number(addon.minimumAmount || 0), Number(customAmountInput || 0));
    }

    const qty = addon.allowQuantity ? quantityInput : 1;
    const subtotal = unitPrice * qty;
    const taxRate = Number(addon.taxRate?.totalRate || 18);
    let tax = 0;
    let total = subtotal;

    if (addon.priceIncludesTax) {
      tax = subtotal - subtotal / (1 + taxRate / 100);
      total = subtotal;
    } else {
      tax = (subtotal * taxRate) / 100;
      total = subtotal + tax;
    }

    return {
      unitPrice: unitPrice.toFixed(2),
      qty,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const live = computeLivePrice();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={addon.name}
        description={`Code: ${addon.code || 'N/A'} • Slug: ${addon.slug}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/admin/product-addons"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <button
              onClick={() => duplicateAddon.mutate(addon.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Copy className="h-4 w-4 text-slate-500" />
              Duplicate
            </button>
            <button
              onClick={() => {
                deleteAddon.mutate(addon.id);
                navigate('/admin/product-addons');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <Link
              to={`/admin/product-addons/${addon.id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Edit className="h-4 w-4" />
              Edit Add-on
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Config Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-base">
                <Gift className="h-5 w-5 text-indigo-600" />
                <span>Add-on Overview</span>
              </div>
              <StatusBadge
                status={addon.status === 'ACTIVE' ? 'success' : addon.status === 'SCHEDULED' ? 'info' : 'neutral'}
                label={addon.status === 'ACTIVE' ? 'Active' : addon.status === 'SCHEDULED' ? 'Scheduled' : 'Inactive'}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block mb-0.5">Input Type</span>
                <span className="font-semibold text-slate-900">{addon.inputType}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-0.5">Pricing Model</span>
                <span className="font-semibold text-slate-900">{addon.pricingType}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-0.5">Base Fixed Price</span>
                <span className="font-semibold text-slate-900">₹{Number(addon.fixedPrice || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-0.5">Required Selection</span>
                <span className="font-semibold text-slate-900">{addon.isRequired ? 'Yes' : 'No (Optional)'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-0.5">Quantity Enabled</span>
                <span className="font-semibold text-slate-900">{addon.allowQuantity ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-0.5">Stock Management</span>
                <span className="font-semibold text-slate-900">
                  {addon.manageStock ? `In Stock (${addon.stockQuantity})` : 'Unmanaged'}
                </span>
              </div>
            </div>

            {addon.shortDescription && (
              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium block mb-0.5">Description</span>
                <p className="text-slate-700 leading-relaxed">{addon.shortDescription}</p>
              </div>
            )}
          </div>

          {/* Option Choices */}
          {addon.options && addon.options.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-semibold text-slate-900 text-base">
                <Layers className="h-5 w-5 text-purple-600" />
                <span>Configured Option Choices ({addon.options.length})</span>
              </div>
              <div className="space-y-2">
                {addon.options.map((opt) => (
                  <div key={opt.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">{opt.name}</span>
                      {opt.code && <span className="ml-2 font-mono text-[10px] text-slate-400">({opt.code})</span>}
                      {opt.isDefault && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-bold">Default</span>}
                    </div>
                    <span className="font-bold text-slate-900">₹{Number(opt.fixedPrice || addon.fixedPrice || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignments */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-semibold text-slate-900 text-base">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <span>Target Assignments</span>
            </div>
            <div className="space-y-2">
              {addon.assignments && addon.assignments.length > 0 ? (
                addon.assignments.map((asg) => (
                  <div key={asg.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs">
                    <span className="font-semibold text-slate-800">{asg.assignmentType}</span>
                    <span className="text-slate-500">Status: {asg.status}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No explicit assignments set.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Customer Preview & Decimal Price Calculator */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl shadow-xl p-6 space-y-5 border border-indigo-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-800/60">
              <div className="flex items-center gap-2 font-bold text-sm text-indigo-200">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Live Customer Add-on Preview</span>
              </div>
              <span className="text-[10px] font-mono bg-indigo-800/80 text-indigo-200 px-2 py-0.5 rounded">
                Product Page Simulator
              </span>
            </div>

            {/* Interactive Widget Render */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 space-y-3 border border-white/10 text-xs">
              <label className="font-bold text-white text-sm block">
                {addon.customerLabel || addon.name}
              </label>

              {addon.inputType === 'CHECKBOX' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="simCheck"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="h-4 w-4 text-indigo-500 rounded border-slate-600 focus:ring-indigo-400"
                  />
                  <label htmlFor="simCheck" className="text-slate-200 cursor-pointer text-xs">
                    Include {addon.name} (+₹{Number(addon.fixedPrice || 0).toFixed(2)})
                  </label>
                </div>
              )}

              {['RADIO', 'DROPDOWN'].includes(addon.inputType) && (
                <select
                  value={selectedOptionId}
                  onChange={(e) => setSelectedOptionId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400"
                >
                  {addon.options?.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} (+₹{Number(o.fixedPrice || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              )}

              {addon.allowQuantity && (
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-slate-300 font-medium">Quantity:</span>
                  <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-800">
                    <button
                      onClick={() => setQuantityInput((q) => Math.max(1, q - 1))}
                      className="px-2.5 py-1 text-slate-300 hover:bg-slate-700 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 font-semibold text-white">{quantityInput}</span>
                    <button
                      onClick={() => setQuantityInput((q) => Math.min(addon.maximumQuantity || 99, q + 1))}
                      className="px-2.5 py-1 text-slate-300 hover:bg-slate-700 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {addon.inputType === 'TEXTAREA' && (
                <textarea
                  rows={2}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={addon.placeholder || 'Type note...'}
                  className="w-full p-2 bg-slate-800 text-white border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-indigo-400"
                />
              )}

              {addon.pricingType === 'CUSTOM_AMOUNT' && (
                <div className="space-y-1">
                  <span className="text-slate-300 text-[11px]">Enter Custom Amount (₹):</span>
                  <input
                    type="number"
                    value={customAmountInput}
                    onChange={(e) => setCustomAmountInput(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 text-white border border-slate-700 rounded-lg text-xs font-bold"
                  />
                </div>
              )}
            </div>

            {/* Calculated Breakdown */}
            <div className="bg-slate-950/80 rounded-xl p-4 space-y-2 border border-indigo-900/50 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Unit Base Price:</span>
                <span className="text-slate-200">₹{live.unitPrice}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Quantity Subtotal:</span>
                <span className="text-slate-200">₹{live.subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>GST / Tax Component:</span>
                <span className="text-amber-400">₹{live.tax}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 font-bold text-sm text-white">
                <span>Total Add-on Charge:</span>
                <span className="text-emerald-400 text-base">₹{live.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
