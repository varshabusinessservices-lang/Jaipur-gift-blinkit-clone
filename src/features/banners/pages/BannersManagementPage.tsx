import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Edit, Trash2, Calendar, MapPin, Store, CheckCircle, XCircle } from 'lucide-react';
import { ImageUploadField } from '../../settings/components/WebSettings/ImageUploadField';

interface Banner {
  id: string;
  title: string;
  desktopImage: string;
  mobileImage: string;
  priority: number;
  active: boolean;
  startDate: string;
  endDate: string;
  zone: string;
  store: string;
}

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'BAN-1',
    title: 'Diwali Special Gifting Festival',
    desktopImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop',
    mobileImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop',
    priority: 1,
    active: true,
    startDate: '2026-10-01',
    endDate: '2026-10-30',
    zone: 'All Zones',
    store: 'All Stores'
  },
  {
    id: 'BAN-2',
    title: 'Midnight Express 10-Min Delivery',
    desktopImage: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop',
    mobileImage: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&auto=format&fit=crop',
    priority: 2,
    active: true,
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    zone: 'C-Scheme & Civil Lines',
    store: 'Jaipur Central Hub'
  }
];

export function BannersManagementPage() {
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [title, setTitle] = useState('');
  const [desktopImage, setDesktopImage] = useState('');
  const [mobileImage, setMobileImage] = useState('');
  const [priority, setPriority] = useState(10);
  const [active, setActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [zone, setZone] = useState('All Zones');
  const [store, setStore] = useState('All Stores');

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setTitle('');
    setDesktopImage('');
    setMobileImage('');
    setPriority(10);
    setActive(true);
    setStartDate('2026-07-27');
    setEndDate('2026-12-31');
    setZone('All Zones');
    setStore('All Stores');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setDesktopImage(b.desktopImage);
    setMobileImage(b.mobileImage);
    setPriority(b.priority);
    setActive(b.active);
    setStartDate(b.startDate);
    setEndDate(b.endDate);
    setZone(b.zone);
    setStore(b.store);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      setBanners(banners.map(b => b.id === editingBanner.id ? { ...b, title, desktopImage, mobileImage, priority, active, startDate, endDate, zone, store } : b));
    } else {
      const newBanner: Banner = {
        id: `BAN-${Date.now()}`,
        title,
        desktopImage: desktopImage || 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800',
        mobileImage: mobileImage || 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400',
        priority,
        active,
        startDate,
        endDate,
        zone,
        store
      };
      setBanners([...banners, newBanner]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Banners Management</h1>
          <p className="text-sm text-slate-500">Manage homepage promotional banners, scheduling, and zone assignments.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add New Banner
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map(banner => (
          <div key={banner.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="relative h-40 bg-slate-100 overflow-hidden">
              <img src={banner.desktopImage} alt={banner.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${banner.active ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                  {banner.active ? 'Active' : 'Inactive'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                  P-{banner.priority}
                </span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{banner.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <MapPin className="h-3 w-3" /> {banner.zone} | <Store className="h-3 w-3" /> {banner.store}
                </div>
                <p className="text-xs text-slate-400 mt-2">Valid: {banner.startDate} to {banner.endDate}</p>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(banner)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-4">{editingBanner ? 'Edit Banner' : 'Create New Banner'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Banner Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Diwali Gifting Special"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                />
              </div>
              <ImageUploadField
                label="Desktop Banner Image"
                value={desktopImage}
                onChange={setDesktopImage}
                description="Recommended 1200x400px"
              />
              <ImageUploadField
                label="Mobile Banner Image"
                value={mobileImage}
                onChange={setMobileImage}
                description="Recommended 600x300px"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Display Priority</label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={active ? 'true' : 'false'}
                    onChange={(e) => setActive(e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                    <option value="Raja Park">Raja Park</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Store Assignment</label>
                  <select
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  >
                    <option value="All Stores">All Stores</option>
                    <option value="Jaipur Central Hub">Jaipur Central Hub</option>
                    <option value="Vaishali Nagar Store">Vaishali Nagar Store</option>
                    <option value="Raja Park Express">Raja Park Express</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">Save Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
