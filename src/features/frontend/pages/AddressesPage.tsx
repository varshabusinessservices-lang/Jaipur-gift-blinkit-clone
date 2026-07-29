import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopStore } from '../store/shopStore';
import { MapPin, Plus, ArrowLeft, Trash2, Edit2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AddressFormModal } from './AddressFormModal';

export const AddressesPage = () => {
  const { currentUser, setLoginModalOpen, addAddress, removeAddress } = useShopStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  if (!currentUser) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <p>Please login</p>
      <Button onClick={() => setLoginModalOpen(true)}>Login</Button>
    </div>
  );

  const handleSave = (addressData: any) => {
    // Basic mock logic utilizing store
    addAddress(addressData);
  };

  const handleEdit = (addr: any) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">My Addresses</h1>
        </div>
        <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New
        </Button>
      </div>

      {currentUser.addresses.length === 0 ? (
        <div className="text-center py-20">
          <MapPin className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-500">No saved addresses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentUser.addresses.map(addr => (
            <div key={addr.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{addr.title}</span>
                </div>
                {addr.isDefault && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">Default</span>}
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{addr.fullAddress}</p>
                <p className="text-xs text-slate-500 mt-2 font-medium">Pincode: {addr.pincode}</p>
                {addr.phone && <p className="text-xs text-slate-500 mt-1 font-medium">Phone: +91 {addr.phone}</p>}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => handleEdit(addr)} className="flex-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => { if(confirm("Delete this address?")) removeAddress(addr.id) }} className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isModalOpen && (
        <AddressFormModal 
          address={editingAddress} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};
