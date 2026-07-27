import React, { useState } from 'react';
import { Layers, Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, CheckCircle } from 'lucide-react';

interface FeaturedSection {
  id: string;
  title: string;
  type: 'Products Grid' | 'Horizontal Carousel' | 'Banner Carousel' | 'Category Showcase';
  itemCount: number;
  priority: number;
  active: boolean;
  linkedCategory: string;
}

const INITIAL_SECTIONS: FeaturedSection[] = [
  { id: 'SEC-1', title: 'Trending Luxury Hampers', type: 'Horizontal Carousel', itemCount: 8, priority: 1, active: true, linkedCategory: 'Luxury Gifts' },
  { id: 'SEC-2', title: '10-Min Midnight Deliveries', type: 'Products Grid', itemCount: 6, priority: 2, active: true, linkedCategory: 'Midnight Specials' },
  { id: 'SEC-3', title: 'Anniversary & Birthday Specials', type: 'Category Showcase', itemCount: 12, priority: 3, active: true, linkedCategory: 'Occasions' },
];

export function FeaturedSectionsManagementPage() {
  const [sections, setSections] = useState<FeaturedSection[]>(INITIAL_SECTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<FeaturedSection | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<FeaturedSection['type']>('Horizontal Carousel');
  const [itemCount, setItemCount] = useState(6);
  const [priority, setPriority] = useState(1);
  const [active, setActive] = useState(true);
  const [linkedCategory, setLinkedCategory] = useState('Luxury Gifts');

  const handleOpenCreate = () => {
    setEditingSection(null);
    setTitle('');
    setType('Horizontal Carousel');
    setItemCount(6);
    setPriority(sections.length + 1);
    setActive(true);
    setLinkedCategory('Luxury Gifts');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: FeaturedSection) => {
    setEditingSection(s);
    setTitle(s.title);
    setType(s.type);
    setItemCount(s.itemCount);
    setPriority(s.priority);
    setActive(s.active);
    setLinkedCategory(s.linkedCategory);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSection) {
      setSections(sections.map(s => s.id === editingSection.id ? { ...s, title, type, itemCount, priority, active, linkedCategory } : s));
    } else {
      const newSec: FeaturedSection = {
        id: `SEC-${Date.now()}`,
        title,
        type,
        itemCount,
        priority,
        active,
        linkedCategory
      };
      setSections([...sections, newSec]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this featured section?')) {
      setSections(sections.filter(s => s.id !== id));
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    // update priorities
    newSections.forEach((s, idx) => s.priority = idx + 1);
    setSections(newSections);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Featured Sections Management</h1>
          <p className="text-sm text-slate-500">Configure homepage layout blocks, product carousels, and priority ordering.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Section
        </button>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-200">
          {sections.map((section, index) => (
            <div key={section.id} className="p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    disabled={index === sections.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {section.priority}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{section.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${section.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {section.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{section.type}</span>
                    <span>Category: {section.linkedCategory}</span>
                    <span>Items: {section.itemCount}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleOpenEdit(section)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(section.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">{editingSection ? 'Edit Featured Section' : 'Add Featured Section'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Section Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Trending Luxury Hampers"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Layout Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  >
                    <option value="Horizontal Carousel">Horizontal Carousel</option>
                    <option value="Products Grid">Products Grid</option>
                    <option value="Banner Carousel">Banner Carousel</option>
                    <option value="Category Showcase">Category Showcase</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Linked Category</label>
                  <select
                    value={linkedCategory}
                    onChange={(e) => setLinkedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  >
                    <option value="Luxury Gifts">Luxury Gifts</option>
                    <option value="Midnight Specials">Midnight Specials</option>
                    <option value="Occasions">Occasions</option>
                    <option value="Flowers & Cakes">Flowers & Cakes</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Item Count</label>
                  <input
                    type="number"
                    value={itemCount}
                    onChange={(e) => setItemCount(Number(e.target.value))}
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
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">Save Section</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
