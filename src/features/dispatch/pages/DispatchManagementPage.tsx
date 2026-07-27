import React, { useState } from 'react';
import { Truck, Search, UserCheck, Clock, MapPin, CheckCircle, AlertTriangle, Navigation, ShieldCheck } from 'lucide-react';

interface DispatchItem {
  id: string;
  orderNumber: string;
  customerName: string;
  storeName: string;
  riderName: string | null;
  status: 'Ready' | 'Assigned' | 'Out For Delivery' | 'Delivered';
  zone: string;
  timeElapsed: string;
  address: string;
}

const INITIAL_DISPATCH: DispatchItem[] = [
  { id: 'DSP-101', orderNumber: '#94821', customerName: 'Priya Sharma', storeName: 'Jaipur Central Hub', riderName: 'Amit Kumar', status: 'Out For Delivery', zone: 'C-Scheme & Civil Lines', timeElapsed: '18 mins', address: 'A-12, Malviya Nagar, Jaipur' },
  { id: 'DSP-102', orderNumber: '#94822', customerName: 'Rahul Verma', storeName: 'Vaishali Nagar Store', riderName: null, status: 'Ready', zone: 'Vaishali Nagar', timeElapsed: '8 mins', address: 'Plot 45, Nirman Nagar, Jaipur' },
  { id: 'DSP-103', orderNumber: '#94824', customerName: 'Neha Singh', storeName: 'Raja Park Express', riderName: 'Sunil Meena', status: 'Assigned', zone: 'Raja Park & Mansarovar', timeElapsed: '12 mins', address: 'C-89, Tilak Nagar, Jaipur' },
];

const RIDER_LIST = ['Amit Kumar', 'Sunil Meena', 'Vikas Sharma', 'Rohitashwa Singh', 'Deepak Verma'];

export function DispatchManagementPage() {
  const [dispatches, setDispatches] = useState<DispatchItem[]>(INITIAL_DISPATCH);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('All');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedRider, setSelectedRider] = useState<string>('');

  const filtered = dispatches.filter(d => {
    const matchesSearch = d.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                          d.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          d.zone.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'All' || d.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleAutoAssign = () => {
    setDispatches(dispatches.map((d, idx) => {
      if (!d.riderName && d.status === 'Ready') {
        return { ...d, riderName: RIDER_LIST[idx % RIDER_LIST.length], status: 'Assigned' };
      }
      return d;
    }));
  };

  const handleManualAssign = (id: string, rider: string) => {
    setDispatches(dispatches.map(d => d.id === id ? { ...d, riderName: rider, status: 'Assigned' } : d));
    setAssigningId(null);
    setSelectedRider('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dispatch Management</h1>
          <p className="text-sm text-slate-500">Real-time order dispatch, rider assignment, and delivery tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoAssign}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Navigation className="h-4 w-4" /> Auto-Assign Riders
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['All', 'Ready', 'Assigned', 'Out For Delivery', 'Delivered'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search order or zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
          />
        </div>
      </div>

      {/* Dispatch Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer & Address</th>
                <th className="py-3 px-4">Store & Zone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Rider</th>
                <th className="py-3 px-4 text-right">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Truck className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-700">No dispatch items found</p>
                    <p className="text-xs text-slate-400 mt-1">All orders are up to date.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-indigo-600">{item.orderNumber}</span>
                      <p className="text-xs text-slate-400">{item.timeElapsed} ago</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900">{item.customerName}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" /> {item.address}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-900 text-xs font-medium">{item.storeName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.zone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        item.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'Out For Delivery' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'Assigned' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.riderName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs">
                            {item.riderName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-900">{item.riderName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded border border-amber-200">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {assigningId === item.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={selectedRider}
                            onChange={(e) => setSelectedRider(e.target.value)}
                            className="px-2 py-1 text-xs border border-slate-300 rounded bg-white text-slate-900"
                          >
                            <option value="">Select Rider</option>
                            {RIDER_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <button
                            onClick={() => selectedRider && handleManualAssign(item.id, selectedRider)}
                            className="px-2.5 py-1 bg-indigo-600 text-white text-xs rounded font-semibold hover:bg-indigo-700"
                          >
                            Assign
                          </button>
                          <button onClick={() => setAssigningId(null)} className="px-2 py-1 text-xs text-slate-500">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setAssigningId(item.id)}
                            className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg hover:bg-indigo-100"
                          >
                            {item.riderName ? 'Reassign' : 'Assign Rider'}
                          </button>
                          {item.status === 'Assigned' && (
                            <button
                              onClick={() => setDispatches(dispatches.map(d => d.id === item.id ? { ...d, status: 'Out For Delivery' } : d))}
                              className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                            >
                              Dispatch
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
