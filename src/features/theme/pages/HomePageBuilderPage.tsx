import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../../frontend/components/ui/Button';
import { Monitor, Smartphone, Tablet, GripVertical, Settings2, Trash2, Plus } from 'lucide-react';

export const HomePageBuilderPage = () => {
  const { draftTheme, fetchAdminTheme, updateHomepageSection, addHomepageSection, deleteHomepageSection, reorderPageSections } = useThemeStore();
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchAdminTheme();
  }, [fetchAdminTheme]);

  if (!draftTheme) {
    return <div>Loading...</div>;
  }

  const homePage = draftTheme.pages?.find((p: any) => p.pageType === 'HOMEPAGE') || { sections: [] };
  const sections = [...(homePage.sections || [])].sort((a, b) => a.position - b.position);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const newSections = Array.from(sections);
      const [reorderedItem] = newSections.splice(draggedIndex, 1);
      newSections.splice(targetIndex, 0, reorderedItem);
      
      const sectionIds = newSections.map(s => s.id);
      await reorderPageSections(sectionIds);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const toggleSectionEnabled = (sectionId: string, current: boolean) => {
    updateHomepageSection(sectionId, { enabled: !current });
  };

  const handleDelete = (sectionId: string) => {
    if (confirm("Are you sure you want to delete this section?")) {
      deleteHomepageSection(sectionId);
    }
  };

  const handleAdd = () => {
    addHomepageSection({
      sectionType: 'WIDE_BANNER',
      title: 'New Section',
      position: sections.length
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Home Page Builder</h1>
          <p className="text-sm text-slate-500">Drag and drop sections to configure the storefront home page.</p>
        </div>
        
        <Button onClick={handleAdd} className="bg-indigo-600 text-white text-xs">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Section
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {sections.map((section: any, index: number) => (
            <div 
              key={section.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white dark:bg-slate-900 border rounded-xl p-4 flex items-center gap-4 shadow-sm transition-all cursor-move ${draggedIndex === index ? 'opacity-50 scale-[0.98]' : 'opacity-100'} ${section.enabled ? 'border-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-900/50'}`}
            >
              
              <div className="text-slate-400 hover:text-slate-600">
                <GripVertical className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{section.sectionType}</span>
                  {!section.enabled && (
                    <span className="text-[10px] bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold">Hidden</span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mt-0.5">{section.title}</h3>
              </div>
              
              <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
                 <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                 
                 <button 
                  onClick={() => toggleSectionEnabled(section.id, section.enabled)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg text-xs font-bold"
                 >
                    {section.enabled ? 'Hide' : 'Show'}
                 </button>
                 
                 <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg">
                    <Settings2 className="w-4 h-4" />
                 </button>
                 
                 <button onClick={() => handleDelete(section.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>

            </div>
          ))}
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-max sticky top-6">
           <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
             <Settings2 className="w-4 h-4" /> Section Settings
           </h3>
           <p className="text-sm text-slate-500">Select a section to configure its layout, data source, and styling.</p>
        </div>
      </div>
    </div>
  );
};
