import React from 'react';

export function ImageUploadField({ label, value, onChange, description, recommendedSize }: { label: string; value: string; onChange: (val: string) => void; description?: string; recommendedSize?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
        {recommendedSize && <span className="text-xs text-slate-400">Rec: {recommendedSize}</span>}
      </div>
      <div className="flex gap-3 items-center">
        {value && <img src={value} alt="Preview" className="w-12 h-12 rounded object-cover border border-slate-200" />}
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.png"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white text-slate-900"
        />
      </div>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
  );
}
