import React, { useState } from 'react';
import { Search, Filter, Eye, Edit, Printer, Download, CheckCircle, Clock, Truck, XCircle, AlertCircle, ShoppingBag, Calendar, DollarSign, User, Store } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  storeName: string;
  itemsCount: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  fulfillmentStatus: 'Placed' | 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled';
  createdAt: string;
  deliveryAddress: string;
  timeline: { title: string; time: string; completed: boolean }[];
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-94821',
    orderNumber: '#94821',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43210',
    storeName: 'Jaipur Central Hub - C-Scheme',
    itemsCount: 3,
    totalAmount: 1499,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Dispatched',
    createdAt: '2026-07-27 10:15 AM',
    deliveryAddress: 'A-12, Malviya Nagar, Jaipur',
    timeline: [
      { title: 'Order Placed', time: '10:15 AM', completed: true },
      { title: 'Packed & Assigned', time: '10:30 AM', completed: true },
      { title: 'Dispatched to Rider', time: '10:45 AM', completed: true },
      { title: 'Delivered', time: 'Pending', completed: false }
    ]
  },
  {
    id: 'ORD-94822',
    orderNumber: '#94822',
    customerName: 'Rahul Verma',
    customerPhone: '+91 91234 56789',
    storeName: 'Vaishali Nagar Store',
    itemsCount: 1,
    totalAmount: 499,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Processing',
    createdAt: '2026-07-27 10:20 AM',
    deliveryAddress: 'Plot 45, Nirman Nagar, Jaipur',
    timeline: [
      { title: 'Order Placed', time: '10:20 AM', completed: true },
      { title: 'Packed & Assigned', time: '10:35 AM', completed: true },
      { title: 'Dispatched to Rider', time: 'Pending', completed: false },
      { title: 'Delivered', time: 'Pending', completed: false }
    ]
  },
  {
    id: 'ORD-94823',
    orderNumber: '#94823',
    customerName: 'Ananya Gupta',
    customerPhone: '+91 99887 76655',
    storeName: 'Raja Park Express',
    itemsCount: 5,
    totalAmount: 2899,
    paymentStatus: 'Pending',
    fulfillmentStatus: 'Placed',
    createdAt: '2026-07-27 10:28 AM',
    deliveryAddress: 'B-4, Tilak Nagar, Jaipur',
    timeline: [
      { title: 'Order Placed', time: '10:28 AM', completed: true },
      { title: 'Packed & Assigned', time: 'Pending', completed: false },
      { title: 'Dispatched to Rider', time: 'Pending', completed: false },
      { title: 'Delivered', time: 'Pending', completed: false }
    ]
  }
];

export function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<Order['fulfillmentStatus']>('Processing');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customerPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || order.fulfillmentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredOrders.map(o => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkStatusUpdate = (status: Order['fulfillmentStatus']) => {
    setOrders(orders.map(o => selectedIds.includes(o.id) ? { ...o, fulfillmentStatus: status } : o));
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const csvHeader = "OrderNumber,CustomerName,Phone,Store,ItemsCount,TotalAmount,PaymentStatus,FulfillmentStatus,Date\n";
    const csvRows = orders.map(o => `${o.orderNumber},"${o.customerName}","${o.customerPhone}","${o.storeName}",${o.itemsCount},${o.totalAmount},${o.paymentStatus},${o.fulfillmentStatus},"${o.createdAt}"`).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders_export.csv';
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
          <p className="text-sm text-slate-500">Monitor live orders, fulfillment status, and customer timelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors cursor-pointer shadow-sm"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['All', 'Placed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'].map(status => (
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

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 px-4 py-3 rounded-xl flex items-center justify-between">
          <span className="text-sm font-medium text-indigo-900">{selectedIds.length} orders selected</span>
          <div className="flex items-center gap-2">
            <button onClick={() => handleBulkStatusUpdate('Processing')} className="px-3 py-1 bg-white border border-indigo-300 text-indigo-700 text-xs font-semibold rounded hover:bg-indigo-100">Set Processing</button>
            <button onClick={() => handleBulkStatusUpdate('Dispatched')} className="px-3 py-1 bg-white border border-indigo-300 text-indigo-700 text-xs font-semibold rounded hover:bg-indigo-100">Set Dispatched</button>
            <button onClick={() => handleBulkStatusUpdate('Delivered')} className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700">Set Delivered</button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Store</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-700">No orders found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => handleSelectOne(order.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-indigo-600">{order.orderNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.customerPhone}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{order.storeName}</td>
                    <td className="py-3 px-4 text-slate-900">{order.itemsCount} items</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">₹{order.totalAmount}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        order.fulfillmentStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        order.fulfillmentStatus === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                        order.fulfillmentStatus === 'Processing' ? 'bg-indigo-100 text-indigo-800' :
                        order.fulfillmentStatus === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {order.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Order Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedOrder(order); setEditStatus(order.fulfillmentStatus); setIsEditing(true); }}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Status"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Print Invoice"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Order {selectedOrder.orderNumber}</h3>
                <p className="text-xs text-slate-500">Placed on {selectedOrder.createdAt}</p>
              </div>
              <button onClick={() => { setSelectedOrder(null); setIsEditing(false); }} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{selectedOrder.customerName}</p>
                  <p className="text-xs text-slate-600">{selectedOrder.customerPhone}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedOrder.deliveryAddress}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fulfillment & Store</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{selectedOrder.storeName}</p>
                  <p className="text-xs text-slate-600 mt-1">Status: <span className="font-semibold text-indigo-600">{selectedOrder.fulfillmentStatus}</span></p>
                  <p className="text-xs text-slate-600">Payment: <span className="font-semibold text-emerald-600">{selectedOrder.paymentStatus}</span></p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">Order Timeline</h4>
                <div className="space-y-3">
                  {selectedOrder.timeline.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {step.completed ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1 flex justify-between items-center bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                        <span className="text-sm font-medium text-slate-900">{step.title}</span>
                        <span className="text-xs text-slate-500">{step.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {isEditing && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3">
                  <h4 className="text-sm font-bold text-indigo-900">Update Fulfillment Status</h4>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg text-sm bg-white text-slate-900"
                  >
                    <option value="Placed">Placed</option>
                    <option value="Processing">Processing</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-slate-600 text-xs font-semibold">Cancel</button>
                    <button
                      onClick={() => {
                        setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, fulfillmentStatus: editStatus } : o));
                        setSelectedOrder({ ...selectedOrder, fulfillmentStatus: editStatus });
                        setIsEditing(false);
                      }}
                      className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                    >
                      Save Status
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <span className="text-lg font-bold text-slate-900">Total: ₹{selectedOrder.totalAmount}</span>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
                  <Printer className="h-4 w-4" /> Print Invoice
                </button>
                <button onClick={() => { setSelectedOrder(null); setIsEditing(false); }} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
