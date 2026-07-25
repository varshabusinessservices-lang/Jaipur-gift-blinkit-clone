import React, { useState } from 'react';
import { Layers, CheckCircle2, AlertCircle, X, DollarSign, Package, Truck, Tag, Trash2, Power } from 'lucide-react';
import { BulkUpdateInput } from '../types/productVariation';

interface VariationBulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onApplyBulkUpdate: (input: BulkUpdateInput) => Promise<void>;
  isLoading: boolean;
}

export const VariationBulkEditModal: React.FC<VariationBulkEditModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  onApplyBulkUpdate,
  isLoading,
}) => {
  const [operation, setOperation] = useState<BulkUpdateInput['operation']>('SET_STATUS');
  const [payload, setPayload] = useState<any>({ status: 'ACTIVE' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOperationChange = (op: BulkUpdateInput['operation']) => {
    setOperation(op);
    setErrorMsg(null);
    if (op === 'SET_STATUS') setPayload({ status: 'ACTIVE' });
    else if (op === 'INCREASE_PRICE_FIXED' || op === 'DECREASE_PRICE_FIXED') setPayload({ amount: '50' });
    else if (op === 'INCREASE_PRICE_PERCENT' || op === 'DECREASE_PRICE_PERCENT') setPayload({ percent: '10' });
    else if (op === 'SET_MRP') setPayload({ mrp: '999.00' });
    else if (op === 'SET_SELLING_PRICE') setPayload({ sellingPrice: '799.00' });
    else if (op === 'SET_STOCK') setPayload({ stockQuantity: '50' });
    else if (op === 'ADD_STOCK') setPayload({ amount: '10' });
    else if (op === 'SET_LOW_STOCK_THRESHOLD') setPayload({ threshold: '5' });
    else if (op === 'ENABLE_SAME_DAY') setPayload({ enabled: true });
    else if (op === 'SET_PREPARATION_TIME') setPayload({ minutes: '45' });
    else if (op === 'SET_TAX_RATE') setPayload({ taxRateId: 'tax-gst-18' });
    else if (op === 'DELETE') setPayload({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onApplyBulkUpdate({
        variationIds: [], // parent component injects selected IDs
        operation,
        payload,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to apply bulk update');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Bulk Edit Variations</h3>
              <p className="text-xs text-gray-500">
                Applying updates to <span className="font-bold text-indigo-600">{selectedCount}</span> selected variation{selectedCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center space-x-2 border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Operation Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
              Select Bulk Action
            </label>
            <select
              value={operation}
              onChange={(e) => handleOperationChange(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <optgroup label="Status & Lifecycle">
                <option value="SET_STATUS">Set Status (Active / Inactive / Out of Stock)</option>
                <option value="DELETE">Soft Delete Selected Variations</option>
              </optgroup>
              <optgroup label="Pricing Controls">
                <option value="SET_SELLING_PRICE">Set Fixed Selling Price</option>
                <option value="SET_MRP">Set Fixed MRP</option>
                <option value="INCREASE_PRICE_FIXED">Increase Selling Price by Fixed Amount (₹)</option>
                <option value="DECREASE_PRICE_FIXED">Decrease Selling Price by Fixed Amount (₹)</option>
                <option value="INCREASE_PRICE_PERCENT">Increase Selling Price by Percentage (%)</option>
                <option value="DECREASE_PRICE_PERCENT">Decrease Selling Price by Percentage (%)</option>
                <option value="SET_TAX_RATE">Override Tax Rate</option>
              </optgroup>
              <optgroup label="Inventory & Stock">
                <option value="SET_STOCK">Set Stock Quantity</option>
                <option value="ADD_STOCK">Add Stock Quantity (Batch Addition)</option>
                <option value="SET_LOW_STOCK_THRESHOLD">Set Low-Stock Alert Threshold</option>
              </optgroup>
              <optgroup label="Fulfillment & Logistics">
                <option value="ENABLE_SAME_DAY">Toggle 90-Min Same-Day Delivery</option>
                <option value="SET_PREPARATION_TIME">Set Preparation Time (Minutes)</option>
              </optgroup>
            </select>
          </div>

          {/* Dynamic Payload Inputs */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
            {operation === 'SET_STATUS' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Status</label>
                <select
                  value={payload.status}
                  onChange={(e) => setPayload({ status: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ACTIVE">ACTIVE (Published)</option>
                  <option value="INACTIVE">INACTIVE (Hidden)</option>
                  <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            )}

            {(operation === 'INCREASE_PRICE_FIXED' || operation === 'DECREASE_PRICE_FIXED') && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Price Adjustment Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-medium">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={payload.amount || ''}
                    onChange={(e) => setPayload({ amount: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>
            )}

            {(operation === 'INCREASE_PRICE_PERCENT' || operation === 'DECREASE_PRICE_PERCENT') && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Price Adjustment Percentage (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={payload.percent || ''}
                    onChange={(e) => setPayload({ percent: e.target.value })}
                    className="w-full pr-8 pl-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 10"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 text-sm font-medium">%</span>
                </div>
              </div>
            )}

            {operation === 'SET_MRP' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">New MRP (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={payload.mrp || ''}
                  onChange={(e) => setPayload({ mrp: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 1499.00"
                />
              </div>
            )}

            {operation === 'SET_SELLING_PRICE' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">New Selling Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={payload.sellingPrice || ''}
                  onChange={(e) => setPayload({ sellingPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 999.00"
                />
              </div>
            )}

            {operation === 'SET_STOCK' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Set Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={payload.stockQuantity || ''}
                  onChange={(e) => setPayload({ stockQuantity: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 50"
                />
              </div>
            )}

            {operation === 'ADD_STOCK' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Stock Amount to Add</label>
                <input
                  type="number"
                  value={payload.amount || ''}
                  onChange={(e) => setPayload({ amount: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 10 (adds to existing quantity)"
                />
              </div>
            )}

            {operation === 'SET_LOW_STOCK_THRESHOLD' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Low-Stock Alert Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={payload.threshold || ''}
                  onChange={(e) => setPayload({ threshold: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 5"
                />
              </div>
            )}

            {operation === 'ENABLE_SAME_DAY' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Same-Day Delivery Status</label>
                <select
                  value={payload.enabled ? 'true' : 'false'}
                  onChange={(e) => setPayload({ enabled: e.target.value === 'true' })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="true">Enable 90-Min Jaipur Delivery</option>
                  <option value="false">Disable 90-Min Jaipur Delivery</option>
                </select>
              </div>
            )}

            {operation === 'SET_PREPARATION_TIME' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Preparation Time (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={payload.minutes || ''}
                  onChange={(e) => setPayload({ minutes: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 45"
                />
              </div>
            )}

            {operation === 'DELETE' && (
              <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded border border-amber-200">
                ⚠️ Warning: Soft deleting will hide these variations from client view and unset default variation status. You can restore them anytime from deleted filter.
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedCount === 0}
              className={`px-5 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all flex items-center space-x-2 ${
                operation === 'DELETE'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } disabled:opacity-50`}
            >
              {isLoading ? (
                <span>Applying Changes...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply Bulk Update</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
