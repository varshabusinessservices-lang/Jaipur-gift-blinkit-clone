import React, { useState } from 'react';
import { Percent, Plus, Edit, Trash2, Calendar, Tag, CheckCircle } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'Percentage' | 'Flat';
  value: number;
  minOrder: number;
  maxDiscount: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  firstOrderOnly: boolean;
  active: boolean;
  zone: string;
}

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'CPN-1',
    code: 'JAIPUR50',
    type: 'Percentage',
    value: 50,
    minOrder: 499,
    maxDiscount: 250,
    startDate: '2026-07-01',
    expiryDate: '2026-12-31',
    usageLimit: 1000,
    firstOrderOnly: true,
    active: true,
    zone: 'All Zones'
  },
  {
    id: 'CPN-2',
    code: 'MIDNIGHT100',
    type: 'Flat',
    value: 100,
    minOrder: 999,
    maxDiscount: 100,
    startDate: '2026-07-01',
    expiryDate: '2026-08-31',
    usageLimit: 500,
    firstOrderOnly: false,
    active: true,
    zone: 'C-Scheme & Civil Lines'
  }
];

export function CouponsManagementPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [code, setCode] = useState('');
  const [type, setType] = useState<'Percentage' | 'Flat'>('Percentage');
  const [value, setValue] = useState(20);
  const [minOrder, setMinOrder] = useState(499);
  const [maxDiscount, setMaxDiscount] = useState(200);
  const [startDate, setStartDate] = useState('2026-07-27');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState(100);
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);
  const [active, setActive] = useState(true);
  const [zone, setZone] = useState('All Zones');

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setCode('');
    setType('Percentage');
    setValue(20);
    setMinOrder(499);
    setMaxDiscount(200);
    setStartDate('2026-07-27');
    setExpiryDate('2026-12-31');
    setUsageLimit(100);
    setFirstOrderOnly(false);
    setActive(true);
    setZone('All Zones');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setType(c.type);
    setValue(c.value);
    setMinOrder(c.minOrder);
    setMaxDiscount(c.maxDiscount);
    setStartDate(c.startDate);
    setExpiryDate(c.expiryDate);
    setUsageLimit(c.usageLimit);
    setFirstOrderOnly(c.firstOrderOnly);
    setActive(c.active);
    setZone(c.zone);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoupon) {
      setCoupons(coupons.map(c => c.id === editingCoupon.id ? { ...c, code: code.toUpperCase(), type, value, minOrder, maxDiscount, startDate, expiryDate, usageLimit, firstOrderOnly, active, zone } : c));
    } else {
      const newCoupon: Coupon = {
        id: `CPN-${Date.now()}`,
        code: code.toUpperCase(),
        type,
        value,
        minOrder,
        maxDiscount,
        startDate,
        expiryDate,
        usageLimit,
        firstOrderOnly,
        active,
        zone
      };
      setCoupons([...coupons, newCoupon]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this coupon?')) {
      setCoupons(coupons.filter(c => c.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coupons & Discounts</h1>
          <p className="text-sm text-slate-500">Create and manage discount codes, usage limits, and zone restrictions.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min Order / Max Cap</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4">Restrictions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Percent className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-700">No coupons available</p>
                  </td>
                </tr>
              ) : (
                coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {coupon.type === 'Percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT`}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      Min: ₹{coupon.minOrder} | Max: ₹{coupon.maxDiscount}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {coupon.startDate} to {coupon.expiryDate}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded font-medium">{coupon.zone}</span>
                        {coupon.firstOrderOnly && <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded font-medium">First Order</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${coupon.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(coupon)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-4">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. FESTIVE50"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase bg-white text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Zone Restriction</label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  >
                    <option value="All Zones">All Zones</option>
                    <option value="C-Scheme & Civil Lines">C-Scheme & Civil Lines</option>
                    <option value="Vaishali Nagar">Vaishali Nagar</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={firstOrderOnly}
                    onChange={(e) => setFirstOrderOnly(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">First Order Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
