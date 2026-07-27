import React, { useState } from 'react';
import { Truck, Search, UserCheck, Phone, Mail, MapPin, Star, ShieldCheck, CheckCircle, XCircle, Download, Navigation, Eye } from 'lucide-react';

interface DeliveryBoy {
  id: string;
  riderNumber: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: 'EV Scooter' | 'Motorcycle' | 'Bicycle';
  vehicleNumber: string;
  assignedOrders: number;
  completedOrders: number;
  todaysOrders: number;
  status: 'Available' | 'Busy' | 'Offline';
  active: boolean;
  zone: string;
  rating: number;
  joiningDate: string;
}

const INITIAL_RIDERS: DeliveryBoy[] = [
  {
    id: 'RDR-101',
    riderNumber: '#R9481',
    name: 'Amit Kumar',
    phone: '+91 98290 12345',
    email: 'amit.rider@jaipurgifting.com',
    vehicleType: 'EV Scooter',
    vehicleNumber: 'RJ 14 EV 4321',
    assignedOrders: 2,
    completedOrders: 142,
    todaysOrders: 8,
    status: 'Available',
    active: true,
    zone: 'C-Scheme & Civil Lines',
    rating: 4.9,
    joiningDate: '2025-11-10'
  },
  {
    id: 'RDR-102',
    riderNumber: '#R9482',
    name: 'Sunil Meena',
    phone: '+91 94140 54321',
    email: 'sunil.rider@jaipurgifting.com',
    vehicleType: 'Motorcycle',
    vehicleNumber: 'RJ 14 AB 8899',
    assignedOrders: 1,
    completedOrders: 98,
    todaysOrders: 6,
    status: 'Busy',
    active: true,
    zone: 'Vaishali Nagar',
    rating: 4.8,
    joiningDate: '2026-02-15'
  },
  {
    id: 'RDR-103',
    riderNumber: '#R9483',
    name: 'Vikas Sharma',
    phone: '+91 96720 99887',
    email: 'vikas.rider@jaipurgifting.com',
    vehicleType: 'EV Scooter',
    vehicleNumber: 'RJ 14 EV 1122',
    assignedOrders: 0,
    completedOrders: 54,
    todaysOrders: 3,
    status: 'Offline',
    active: true,
    zone: 'Raja Park',
    rating: 4.7,
    joiningDate: '2026-05-01'
  }
];

export function DeliveryBoysManagementPage() {
  const [riders, setRiders] = useState<DeliveryBoy[]>(INITIAL_RIDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedRider, setSelectedRider] = useState<DeliveryBoy | null>(null);

  const filtered = riders.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                          r.phone.includes(search) ||
                          r.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
                          r.riderNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleActive = (id: string) => {
    setRiders(riders.map(r => r.id === id ? { ...r, active: !r.active, status: !r.active ? 'Available' : 'Offline' } : r));
  };

  const handleExportCSV = () => {
    const csvHeader = "RiderID,Name,Phone,VehicleType,VehicleNumber,CompletedOrders,Rating,Status\n";
    const csvRows = riders.map(r => `"${r.riderNumber}","${r.name}","${r.phone}","${r.vehicleType}","${r.vehicleNumber}",${r.completedOrders},${r.rating},"${r.status}"`).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'delivery_boys_export.csv';
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Delivery Boys Management</h1>
          <p className="text-sm text-slate-500">Manage 10-minute delivery riders, live Google Maps tracking, zones, and stats.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by rider name, phone, or vehicle number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['All', 'Available', 'Busy', 'Offline'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${statusFilter === status ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Riders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Rider</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">Orders Today</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Truck className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-700">No delivery riders found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(rider => (
                  <tr key={rider.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
                          {rider.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{rider.name}</p>
                          <p className="text-xs text-slate-500">{rider.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900 text-xs">{rider.vehicleType}</p>
                      <p className="text-xs text-indigo-600 font-mono mt-0.5">{rider.vehicleNumber}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">{rider.zone}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{rider.todaysOrders} orders</span>
                      <p className="text-xs text-slate-400">{rider.completedOrders} total</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star className="h-3.5 w-3.5 fill-current" /> {rider.rating}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        rider.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                        rider.status === 'Busy' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {rider.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedRider(rider)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Rider Profile & Google Maps"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(rider.id)}
                        className={`p-1.5 rounded-lg transition-colors ${rider.active ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        title={rider.active ? 'Deactivate' : 'Activate'}
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal with Google Maps Context */}
      {selectedRider && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {selectedRider.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedRider.name}</h3>
                  <p className="text-xs text-indigo-600 font-mono">{selectedRider.riderNumber} • Joining: {selectedRider.joiningDate}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRider(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl text-center">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Today's Orders</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{selectedRider.todaysOrders}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Total Deliveries</p>
                  <p className="text-lg font-bold text-indigo-600 mt-1">{selectedRider.completedOrders}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Rating</p>
                  <p className="text-lg font-bold text-amber-500 mt-1 flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-current" /> {selectedRider.rating}
                  </p>
                </div>
              </div>

              {/* Google Maps Live Location Integration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Navigation className="h-4 w-4 text-indigo-600" /> Live Google Maps Tracking
                  </h4>
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">GPS Active</span>
                </div>
                <div className="h-48 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <MapPin className="h-10 w-10 text-indigo-600 animate-bounce mb-2" />
                  <p className="text-sm font-semibold text-slate-800">Current Zone: {selectedRider.zone}</p>
                  <p className="text-xs text-slate-500 mt-1">Vehicle: {selectedRider.vehicleType} ({selectedRider.vehicleNumber})</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button onClick={() => setSelectedRider(null)} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
