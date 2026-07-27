import React, { useState, useEffect } from 'react';
import { Store, Truck, Building2, Users, Package, Printer, ShieldCheck, DollarSign, Plus, ArrowRightLeft, CheckCircle2, Clock } from 'lucide-react';

export function EnterpriseStoreDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'inventory' | 'transfers' | 'vendors' | 'franchises' | 'printing' | 'capacity' | 'delivery'>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [printingJobs, setPrintingJobs] = useState<any[]>([]);
  const [capacities, setCapacities] = useState<any[]>([]);
  const [deliveryAdapters, setDeliveryAdapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form modals state
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreType, setNewStoreType] = useState('RETAIL_STORE');
  const [newStoreGstin, setNewStoreGstin] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await fetch('/api/v1/admin/enterprise/dashboard');
        const json = await res.json();
        if (json.success) setDashboardData(json.data);
      } else if (activeTab === 'stores') {
        const res = await fetch('/api/v1/admin/enterprise/stores');
        const json = await res.json();
        if (json.success) setStores(json.data);
      } else if (activeTab === 'inventory') {
        const res = await fetch('/api/v1/admin/enterprise/inventory');
        const json = await res.json();
        if (json.success) setInventory(json.data);
      } else if (activeTab === 'transfers') {
        const res = await fetch('/api/v1/admin/enterprise/transfers');
        const json = await res.json();
        if (json.success) setTransfers(json.data);
      } else if (activeTab === 'vendors') {
        const res = await fetch('/api/v1/admin/enterprise/vendors');
        const json = await res.json();
        if (json.success) setVendors(json.data);
      } else if (activeTab === 'franchises') {
        const res = await fetch('/api/v1/admin/enterprise/franchises');
        const json = await res.json();
        if (json.success) setFranchises(json.data);
      } else if (activeTab === 'printing') {
        const res = await fetch('/api/v1/admin/enterprise/printing-jobs');
        const json = await res.json();
        if (json.success) setPrintingJobs(json.data);
      } else if (activeTab === 'capacity') {
        const res = await fetch('/api/v1/admin/enterprise/capacities');
        const json = await res.json();
        if (json.success) setCapacities(json.data);
      } else if (activeTab === 'delivery') {
        const res = await fetch('/api/v1/admin/enterprise/delivery-adapters');
        const json = await res.json();
        if (json.success) setDeliveryAdapters(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/enterprise/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName: newStoreName, storeType: newStoreType, gstin: newStoreGstin, address: 'Jaipur, Rajasthan' }),
      });
      const json = await res.json();
      if (json.success) {
        setShowStoreModal(false);
        setNewStoreName('');
        setNewStoreGstin('');
        fetchData();
      }
    } catch (err) {
      alert('Failed to create store');
    }
  };

  const updateTransferStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/v1/admin/enterprise/transfers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: `Status updated to ${status} by admin` }),
      });
      fetchData();
    } catch (err) {
      alert('Failed to update transfer status');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Multi-Store & Supply Chain Control</h1>
          <p className="text-sm text-slate-500 mt-1">Multi-store network, franchise management, warehouse transfers, vendor fulfilment & capacities for Jaipur Gifting.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowStoreModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition">
            <Plus className="h-4 w-4" /> Add Store / Node
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview KPIs' },
          { id: 'stores', label: 'Store Network' },
          { id: 'inventory', label: 'Store Inventory' },
          { id: 'transfers', label: 'Store Transfers' },
          { id: 'vendors', label: 'Vendors & POs' },
          { id: 'franchises', label: 'Franchise Network' },
          { id: 'printing', label: 'Printing Partners' },
          { id: 'capacity', label: 'Capacity Engine' },
          { id: 'delivery', label: 'Delivery Adapters' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading enterprise data...</div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'overview' && dashboardData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Stores / Nodes</span>
                  <Store className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{dashboardData.totalStores}</div>
                <p className="text-xs text-slate-500 mt-1">Multi-store isolation active</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Transfers</span>
                  <ArrowRightLeft className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{dashboardData.activeTransfers}</div>
                <p className="text-xs text-slate-500 mt-1">Inter-store logistics</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Registered Vendors</span>
                  <Truck className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{dashboardData.totalVendors}</div>
                <p className="text-xs text-slate-500 mt-1">Suppliers & Couriers</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Franchise Partners</span>
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{dashboardData.totalFranchises}</div>
                <p className="text-xs text-slate-500 mt-1">Royalty & Commission model</p>
              </div>
            </div>
          )}

          {activeTab === 'stores' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Enterprise Store Network</h3>
                <span className="text-xs text-slate-500">{stores.length} stores configured</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Store Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">GSTIN</th>
                      <th className="p-3">Address</th>
                      <th className="p-3">Delivery Radius</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {stores.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{s.storeName}</td>
                        <td className="p-3"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">{s.storeType}</span></td>
                        <td className="p-3 font-mono text-xs">{s.gstin}</td>
                        <td className="p-3 text-xs text-slate-500">{s.address}</td>
                        <td className="p-3 text-xs">{s.deliveryRadiusKm || 15} km</td>
                        <td className="p-3"><span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Multi-Store Isolated Inventory</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Store ID</th>
                      <th className="p-3">Product ID</th>
                      <th className="p-3 text-right">Available</th>
                      <th className="p-3 text-right">Reserved</th>
                      <th className="p-3 text-right">In Production</th>
                      <th className="p-3 text-right">Damaged</th>
                      <th className="p-3 text-right">Returned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {inventory.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-xs text-slate-500">{inv.storeId}</td>
                        <td className="p-3 font-medium text-slate-900">{inv.productId}</td>
                        <td className="p-3 text-right font-semibold text-emerald-600">{inv.available}</td>
                        <td className="p-3 text-right text-amber-600">{inv.reserved}</td>
                        <td className="p-3 text-right text-indigo-600">{inv.inProduction}</td>
                        <td className="p-3 text-right text-red-600">{inv.damaged}</td>
                        <td className="p-3 text-right text-slate-600">{inv.returned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'transfers' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Inter-Store Transfer Centre</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Transfer #</th>
                      <th className="p-3">Source Store</th>
                      <th className="p-3">Destination Store</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Timeline Events</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {transfers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{t.transferNumber}</td>
                        <td className="p-3 font-mono text-xs text-slate-500">{t.sourceStoreId}</td>
                        <td className="p-3 font-mono text-xs text-slate-500">{t.destinationStoreId}</td>
                        <td className="p-3"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">{t.status}</span></td>
                        <td className="p-3 text-xs text-slate-500">{t.timeline?.length || 1} steps logged</td>
                        <td className="p-3 text-right space-x-2">
                          {t.status === 'REQUESTED' && (
                            <button onClick={() => updateTransferStatus(t.id, 'APPROVED')} className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700">Approve</button>
                          )}
                          {t.status === 'APPROVED' && (
                            <button onClick={() => updateTransferStatus(t.id, 'DISPATCHED')} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700">Dispatch</button>
                          )}
                          {t.status === 'DISPATCHED' && (
                            <button onClick={() => updateTransferStatus(t.id, 'RECEIVED')} className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">Receive</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Vendor Management & Purchase Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Vendor Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">GSTIN</th>
                      <th className="p-3">Payment Terms</th>
                      <th className="p-3">Lead Time</th>
                      <th className="p-3">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {vendors.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{v.vendorName}</td>
                        <td className="p-3"><span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">{v.vendorType}</span></td>
                        <td className="p-3 font-mono text-xs">{v.gstin}</td>
                        <td className="p-3 text-xs">{v.paymentTerms}</td>
                        <td className="p-3 text-xs">{v.leadTimeDays} days</td>
                        <td className="p-3 text-xs font-bold text-amber-600">★ {v.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'franchises' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Franchise Network & Royalty Engine</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Franchise Store Name</th>
                      <th className="p-3">Owner</th>
                      <th className="p-3 text-right">Commission %</th>
                      <th className="p-3 text-right">Royalty %</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {franchises.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{f.storeName}</td>
                        <td className="p-3 text-xs">{f.franchiseOwner}</td>
                        <td className="p-3 text-right font-medium text-emerald-600">{f.commissionPercentage}%</td>
                        <td className="p-3 text-right font-medium text-indigo-600">{f.royaltyPercentage}%</td>
                        <td className="p-3"><span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">{f.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'printing' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-800">External Printing Partner Engine</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Partner Name</th>
                      <th className="p-3">Print Type</th>
                      <th className="p-3">Specification</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {printingJobs.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{j.partnerName}</td>
                        <td className="p-3"><span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-semibold">{j.printType}</span></td>
                        <td className="p-3 text-xs text-slate-500">{j.specification}</td>
                        <td className="p-3 text-right font-semibold">{j.quantity}</td>
                        <td className="p-3"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">{j.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'capacity' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Store Capacity & Overbooking Prevention</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Store ID</th>
                      <th className="p-3 text-right">Daily Production Limit</th>
                      <th className="p-3 text-right">Hourly Delivery Cap</th>
                      <th className="p-3 text-right">Printing Capacity</th>
                      <th className="p-3 text-right">Packing Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {capacities.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-xs text-slate-500">{c.storeId}</td>
                        <td className="p-3 text-right font-semibold text-indigo-600">{c.dailyProductionLimit} units</td>
                        <td className="p-3 text-right font-semibold text-emerald-600">{c.hourlyDeliveryCapacity} orders/hr</td>
                        <td className="p-3 text-right font-semibold">{c.printingCapacity}</td>
                        <td className="p-3 text-right font-semibold">{c.packingCapacity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Third-Party Delivery Provider Adapters</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Provider Name</th>
                      <th className="p-3">Adapter Code</th>
                      <th className="p-3">API Endpoint</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {deliveryAdapters.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{d.providerName}</td>
                        <td className="p-3 font-mono text-xs">{d.adapterCode}</td>
                        <td className="p-3 text-xs text-slate-500">{d.apiEndpoint || 'https://api.adapter.internal'}</td>
                        <td className="p-3"><span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">Connected</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Store Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Enterprise Store / Fulfillment Node</h3>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="e.g. Jaipur Vaishali Nagar Retail"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Store Type</label>
                <select
                  value={newStoreType}
                  onChange={(e) => setNewStoreType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="HEAD_OFFICE">Head Office</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="PRODUCTION_STORE">Production Store</option>
                  <option value="RETAIL_STORE">Retail Store</option>
                  <option value="FRANCHISE_STORE">Franchise Store</option>
                  <option value="MICRO_FULFILMENT_CENTER">Micro Fulfilment Center</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">GSTIN</label>
                <input
                  type="text"
                  required
                  value={newStoreGstin}
                  onChange={(e) => setNewStoreGstin(e.target.value)}
                  placeholder="e.g. 08AABCJ1234K1ZU"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowStoreModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
