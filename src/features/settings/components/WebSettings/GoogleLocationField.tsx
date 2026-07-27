import React from 'react';

export function GoogleLocationField({ label, value, latValue, lngValue, onChange, description }: { label: string; value?: string; latValue?: any; lngValue?: any; onChange: (lat: any, lng: any) => void; description?: string }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={latValue !== undefined ? latValue : ''}
            onChange={(e) => onChange(e.target.value, lngValue)}
            placeholder="26.9124"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white text-slate-900"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={lngValue !== undefined ? lngValue : ''}
            onChange={(e) => onChange(latValue, e.target.value)}
            placeholder="75.7873"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white text-slate-900"
          />
        </div>
      </div>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
  );
}
