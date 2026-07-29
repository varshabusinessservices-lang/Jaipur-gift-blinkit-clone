import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const AddressFormModal = ({ onClose, onSave, address }: any) => {
  const [formData, setFormData] = useState(address || {
    title: '',
    fullAddress: '',
    pincode: '',
    phone: '',
    isDefault: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {address ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Address Title (e.g. Home, Office)</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Home"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Address</label>
            <textarea 
              required
              rows={3}
              value={formData.fullAddress}
              onChange={e => setFormData({...formData, fullAddress: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="House/Flat No., Street, Landmark"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Pincode</label>
              <input 
                type="text" 
                required
                value={formData.pincode}
                onChange={e => setFormData({...formData, pincode: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="302001"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Phone (Optional)</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="9876543210"
              />
            </div>
          </div>
          <label className="flex items-center gap-3 pt-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.isDefault}
              onChange={e => setFormData({...formData, isDefault: e.target.checked})}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Set as default address</span>
          </label>
          
          <div className="pt-6 flex gap-3">
            <Button type="button" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-indigo-600 text-white">
              Save Address
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
