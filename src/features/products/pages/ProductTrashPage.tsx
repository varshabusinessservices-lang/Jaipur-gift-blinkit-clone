import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProductList, useProductActions } from '../hooks/useProducts';
import { ArrowLeft, RotateCcw, Trash, Package } from 'lucide-react';

export function ProductTrashPage() {
  const navigate = useNavigate();
  const { products, loading, error, refetch } = useProductList({
    includeDeleted: true,
    page: 1,
    limit: 20,
  });

  const { restoreProduct } = useProductActions();

  const handleRestore = async (id: string) => {
    try {
      await restoreProduct(id);
      alert('Product restored successfully!');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to restore product');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Soft-Deleted Product Trash Bin</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Items in trash are safely archived and can be restored back to the catalog anytime.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading trash bin...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-600 text-sm">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Trash className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Trash Bin is Empty</p>
            <Link to="/admin/products" className="text-xs font-semibold text-indigo-600 hover:underline">
              Return to Catalog
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Deleted Product</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Deleted At</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.mainImageUrl ||
                            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80'
                          }
                          alt={p.title}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{p.title}</p>
                          <p className="text-xs text-slate-400 font-mono">{p.sku || p.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">{p.productType}</td>

                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {p.deletedAt ? new Date(p.deletedAt).toLocaleString('en-IN') : '--'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRestore(p.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
