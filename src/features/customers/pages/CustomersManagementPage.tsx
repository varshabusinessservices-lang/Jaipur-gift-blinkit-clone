import React, { useState } from 'react';
import { Users, Search, Filter, Eye, Edit, Trash2, Mail, Phone, Calendar, DollarSign, ShoppingBag, ShieldCheck, CheckCircle, XCircle, Download } from 'lucide-react';

interface Customer {
  id: string;
  customerNumber: string;
  name: string;
  phone: string;
  email: string;
  registeredOn: string;
  totalOrders: number;
  totalSpend: number;
  walletBalance: number;
  referralStatus: 'Active' | 'Inactive';
  lastOrder: string;
  status: 'Active' | 'Disabled';
  addresses: string[];
  notes: string;
}

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-101',
    customerNumber: '#C94821',
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    email: 'priya.sharma@gmail.com',
    registeredOn: '2026-01-15',
    totalOrders: 18,
    totalSpend: 14250,
    walletBalance: 450,
    referralStatus: 'Active',
    lastOrder: '2026-07-27',
    status: 'Active',
    addresses: ['A-12, Malviya Nagar, Jaipur', 'Plot 4, C-Scheme, Jaipur'],
    notes: 'VIP Gifting Customer. Prefers express morning delivery.'
  },
  {
    id: 'CUST-102',
    customerNumber: '#C94822',
    name: 'Rahul Verma',
    phone: '+91 91234 56789',
    email: 'rahul.verma@yahoo.com',
    registeredOn: '2026-03-20',
    totalOrders: 7,
    totalSpend: 5100,
    walletBalance: 100,
    referralStatus: 'Inactive',
    lastOrder: '2026-07-26',
    status: 'Active',
    addresses: ['Plot 45, Nirman Nagar, Jaipur'],
    notes: 'Frequent chocolate hamper buyer.'
  },
  {
    id: 'CUST-103',
    customerNumber: '#C94823',
    name: 'Ananya Gupta',
    phone: '+91 99887 76655',
    email: 'ananya.gupta@outlook.com',
    registeredOn: '2026-06-10',
    totalOrders: 3,
    totalSpend: 2899,
    walletBalance: 0,
    referralStatus: 'Active',
    lastOrder: '2026-07-25',
    status: 'Active',
    addresses: ['B-4, Tilak Nagar, Jaipur'],
    notes: 'First order discount used.'
  }
];

export function CustomersManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState('');

  const filtered = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.phone.includes(search) ||
                          c.email.toLowerCase().includes(search.toLowerCase()) ||
                          c.customerNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (id: string) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? 'Disabled' : 'Active' } : c));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to soft delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const handleExportCSV = () => {
    const csvHeader = "CustomerID,Name,Phone,Email,RegisteredOn,TotalOrders,TotalSpend,WalletBalance,Status\n";
    const csvRows = customers.map(c => `"${c.customerNumber}","${c.name}","${c.phone}","${c.email}","${c.registeredOn}",${c.totalOrders},${c.totalSpend},${c.walletBalance},"${c.status}"`).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers_export.csv';
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers Management</h1>
          <p className="text-sm text-slate-500">View registered customers, wallet balances, order histories, and profiles.</p>
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
            placeholder="Search by name, phone, email, or customer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {['All', 'Active', 'Disabled'].map(status => (
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

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4">Orders & Spend</th>
                <th className="py-3 px-4">Wallet</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-700">No customers found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{customer.name}</p>
                          <span className="text-xs text-indigo-600 font-mono">{customer.customerNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs text-slate-900 flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /> {customer.phone}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3 text-slate-400" /> {customer.email}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">{customer.registeredOn}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{customer.totalOrders} orders</p>
                      <p className="text-xs text-emerald-600 font-medium">₹{customer.totalSpend.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-indigo-600">₹{customer.walletBalance}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${customer.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(customer.id)}
                        className={`p-1.5 rounded-lg transition-colors ${customer.status === 'Active' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        title={customer.status === 'Active' ? 'Disable' : 'Enable'}
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
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

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-indigo-600 font-mono">{selectedCustomer.customerNumber}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Info</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{selectedCustomer.phone}</p>
                  <p className="text-xs text-slate-600">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financial Summary</p>
                  <p className="text-sm font-semibold text-emerald-600 mt-1">Total Spend: ₹{selectedCustomer.totalSpend.toLocaleString()}</p>
                  <p className="text-xs text-indigo-600">Wallet: ₹{selectedCustomer.walletBalance}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Saved Addresses</h4>
                <div className="space-y-2">
                  {selectedCustomer.addresses.map((addr, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-700">
                      📍 {addr}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Admin Notes</h4>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900">
                  {selectedCustomer.notes}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button onClick={() => setSelectedCustomer(null)} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
