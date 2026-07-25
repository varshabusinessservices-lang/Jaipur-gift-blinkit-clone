import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus, Search, Filter, Trash2, Copy, Edit, Eye, MoreVertical,
  ClipboardList, CheckCircle, AlertCircle, RefreshCw, Smartphone, Tablet, Monitor, Check, X, Tag
} from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { personalisationFormsService } from '../services/personalisationFormsService';
import { toast } from 'sonner';

export function PersonalisationFormListPage() {
  const navigate = useNavigate();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [globalWhatsApp, setGlobalWhatsApp] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<any | null>(null);
  const [assignProductId, setAssignProductId] = useState('');
  const [assignVariationId, setAssignVariationId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const data = await personalisationFormsService.listForms();
      setForms(data || []);
      const settings = await personalisationFormsService.getGlobalSettings();
      setGlobalWhatsApp(settings?.requireWhatsAppForAllPersonalisedProducts !== false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load personalisation forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleGlobalWhatsAppChange = async (val: boolean) => {
    try {
      setUpdatingSettings(true);
      await personalisationFormsService.updateGlobalSettings({
        requireWhatsAppForAllPersonalisedProducts: val,
      });
      setGlobalWhatsApp(val);
      toast.success('Global settings updated successfully');
    } catch (error) {
      toast.error('Failed to update global settings');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      toast.loading('Duplicating form...', { id: 'dup' });
      await personalisationFormsService.duplicateForm(id);
      toast.success('Form duplicated successfully', { id: 'dup' });
      fetchForms();
    } catch (error) {
      toast.error('Failed to duplicate form', { id: 'dup' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this personalisation form? This action is soft-delete but will unassign it.')) {
      return;
    }
    try {
      await personalisationFormsService.deleteForm(id);
      toast.success('Form deleted successfully');
      fetchForms();
    } catch (error) {
      toast.error('Failed to delete form');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAssignModal) return;
    if (!assignProductId && !assignVariationId) {
      toast.error('Please enter either a Product ID or Variation ID');
      return;
    }

    try {
      setAssigning(true);
      await personalisationFormsService.assignForm(showAssignModal.id, {
        productId: assignProductId || undefined,
        variationId: assignVariationId || undefined,
      });
      toast.success('Form assigned successfully');
      setShowAssignModal(null);
      setAssignProductId('');
      setAssignVariationId('');
    } catch (error) {
      toast.error('Failed to assign form');
    } finally {
      setAssigning(false);
    }
  };

  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.name.toLowerCase().includes(search.toLowerCase()) ||
      (form.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || form.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personalisation Forms Builder"
        description="Design forms visually to collect customer customization inputs like photos, messages, dates, numbers, and custom parameters. Fully configurable per product."
        actions={
          <Link
            to="/admin/personalisation-forms/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Personalisation Form
          </Link>
        }
      />

      {/* Global Setting Block */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              Global Production Safety Settings
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Production communication is vital. When enabled, every personalisation form will mandate a WhatsApp phone number collection, overriding individual form settings if they mark it as optional.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-center">
            <span className="text-sm font-medium text-slate-600">Require WhatsApp Number</span>
            <button
              onClick={() => handleGlobalWhatsAppChange(!globalWhatsApp)}
              disabled={updatingSettings}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                globalWhatsApp ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  globalWhatsApp ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and search controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search forms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
          <button
            onClick={fetchForms}
            className="p-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Forms Grid/List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading personalisation forms...</div>
      ) : filteredForms.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-slate-900">No Personalisation Forms</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            You haven't built any custom forms yet. Click 'Create Personalisation Form' to start building.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Form Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug & Version</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fields Summary</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredForms.map((form) => {
                  const fieldCount = form.fields?.length || 0;
                  const hasPhoto = form.fields?.some((f: any) =>
                    ['MAIN_PHOTO', 'SUPPORTING_PHOTOS', 'IMAGE', 'MULTI_IMAGE'].includes(f.fieldType)
                  );
                  return (
                    <tr key={form.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-sm">{form.name}</span>
                          <span className="text-xs text-slate-500 max-w-sm truncate mt-0.5">{form.description || 'No description provided.'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md self-start font-mono">{form.slug}</span>
                          <span className="text-xs text-indigo-600 font-semibold mt-1">v{form.version}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800">{fieldCount} Fields</span>
                          {hasPhoto && (
                            <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-1.5 rounded font-medium">
                              Photos
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            form.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${form.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {form.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/personalisation-forms/${form.id}`}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Preview / Production View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/admin/personalisation-forms/${form.id}/edit`}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit / New Version"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDuplicate(form.id)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Duplicate Form"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowAssignModal(form)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Assign to Product/Variation"
                          >
                            <Tag className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(form.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Form"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignment Modal overlay */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowAssignModal(null);
                setAssignProductId('');
                setAssignVariationId('');
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Assign Form</h3>
            <p className="text-sm text-slate-500 mb-4">
              Assign form <span className="font-semibold">"{showAssignModal.name}"</span> to a specific Product or Variation.
            </p>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Product ID</label>
                <input
                  type="text"
                  placeholder="e.g. prod-123"
                  value={assignProductId}
                  onChange={(e) => {
                    setAssignProductId(e.target.value);
                    if (e.target.value) setAssignVariationId('');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:ring-indigo-500 focus:outline-none focus:ring-1"
                />
              </div>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase">OR</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Variation ID</label>
                <input
                  type="text"
                  placeholder="e.g. var-789"
                  value={assignVariationId}
                  onChange={(e) => {
                    setAssignVariationId(e.target.value);
                    if (e.target.value) setAssignProductId('');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:ring-indigo-500 focus:outline-none focus:ring-1"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(null);
                    setAssignProductId('');
                    setAssignVariationId('');
                  }}
                  className="flex-1 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="flex-1 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow"
                >
                  {assigning ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
