import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopStore } from '../store/shopStore';
import { Package, Clock, CheckCircle2, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const OrdersPage = () => {
  const { currentUser } = useShopStore();
  const navigate = useNavigate();

  const orders = currentUser?.orders || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">My Order History</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <p className="text-sm text-slate-500">You have no orders yet.</p>
          <Button onClick={() => navigate('/')} className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl">
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(ord => (
            <div key={ord.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">{ord.orderNumber}</span>
                  <div className="text-xs text-slate-400 mt-0.5">Placed {ord.createdAt}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {ord.status}
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-indigo-600" /> {ord.deliveryTime}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {ord.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img src={item.productImage} alt={item.productName} className="w-16 h-16 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.productName}</h4>
                      <span className="text-[11px] text-slate-400">Qty: {item.quantity} • ₹{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">Delivery Address: {ord.deliveryAddress?.fullAddress}</span>
                <span className="text-base font-black text-slate-900 dark:text-white">Total: ₹{ord.totalAmount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
