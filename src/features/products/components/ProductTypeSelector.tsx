import React, { useState } from 'react';
import { ProductType } from '../types/product';
import { Package, Layers, Gift, Sparkles, AlertTriangle, Check } from 'lucide-react';

interface ProductTypeOption {
  type: ProductType;
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}

const PRODUCT_TYPES: ProductTypeOption[] = [
  {
    type: 'SIMPLE',
    title: 'Simple Product',
    description: 'Standalone physical item with fixed price, single SKU, and basic stock tracking.',
    icon: Package,
  },
  {
    type: 'VARIABLE',
    title: 'Variable Product',
    description: 'Item with multiple variants (Size, Colour, Material) each having distinct prices & SKUs.',
    icon: Layers,
  },
  {
    type: 'COMBO',
    title: 'Combo Product',
    description: 'Bundled group of simple or variable items sold together at a combined discount.',
    icon: Gift,
  },
  {
    type: 'GIFT_SET',
    title: 'Gift Set / Box',
    description: 'Curated luxury gift hamper with custom outer box, card, and optional items.',
    icon: Gift,
    badge: 'Popular for Jaipur Gifting',
  },
  {
    type: 'PERSONALISED',
    title: 'Personalised Product',
    description: 'Custom photo frame, engraved mug, plaque, or t-shirt requiring buyer customization.',
    icon: Sparkles,
    badge: 'Core Gifting Type',
  },
];

interface ProductTypeSelectorProps {
  value: ProductType;
  onChange: (newType: ProductType) => void;
  disabled?: boolean;
}

export function ProductTypeSelector({ value, onChange, disabled }: ProductTypeSelectorProps) {
  const [pendingType, setPendingType] = useState<ProductType | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleSelect = (selectedType: ProductType) => {
    if (disabled || selectedType === value) return;

    // If changing type after data entry, show explicit warning modal
    setPendingType(selectedType);
    setShowWarningModal(true);
  };

  const confirmTypeChange = () => {
    if (pendingType) {
      onChange(pendingType);
    }
    setShowWarningModal(false);
    setPendingType(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-1">
          Product Type <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Select the fundamental product structure. Changing this later will reconfigure available fields.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRODUCT_TYPES.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.type;

          return (
            <div
              key={opt.type}
              onClick={() => handleSelect(opt.type)}
              className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {opt.badge && (
                <span className="absolute top-2.5 right-2.5 text-[10px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {opt.badge}
                </span>
              )}

              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-lg ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="pr-6">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-slate-900">{opt.title}</h4>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning Modal on Product Type Change */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Change Product Type?</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              You are changing the product type from <strong className="text-slate-900">{value}</strong> to{' '}
              <strong className="text-slate-900">{pendingType}</strong>. Some incompatible fields or configurations
              (such as variation selections or combo items) may be hidden or reset.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Keep Current Type
              </button>
              <button
                type="button"
                onClick={confirmTypeChange}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                Confirm Type Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
