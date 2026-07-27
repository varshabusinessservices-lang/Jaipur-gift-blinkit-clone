import React from 'react';
import { Check, FileText, HelpCircle, AlertTriangle } from 'lucide-react';
import { CustomerUpload } from '../types/customerUploads';

interface UploadSummaryProps {
  uploads: CustomerUpload[];
  requiredFieldsCount?: number;
}

export const UploadSummary: React.FC<UploadSummaryProps> = ({
  uploads,
  requiredFieldsCount = 0,
}) => {
  const totalCount = uploads.length;
  const invalidCount = uploads.filter((u) => {
    const res = u.validationResultJson ? JSON.parse(u.validationResultJson) : null;
    return res ? !res.valid : u.lifecycleStatus === 'VALIDATION_FAILED';
  }).length;

  const validCount = totalCount - invalidCount;

  return (
    <div id="upload-summary-panel" className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
        <FileText className="h-4 w-4 text-indigo-500" />
        Personalisation Summary
      </h4>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white p-2.5 rounded-lg border border-slate-150">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Files</p>
          <p className="text-lg font-extrabold text-slate-800">{totalCount}</p>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-slate-150">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pristine Quality</p>
          <p className="text-lg font-extrabold text-green-600">{validCount}</p>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-slate-150">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Warnings</p>
          <p className="text-lg font-extrabold text-amber-600">{invalidCount}</p>
        </div>
      </div>

      {invalidCount > 0 && (
        <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <span>
            Some uploaded files have low-resolution or layout warnings. We recommend re-uploading higher quality assets to guarantee premium print results.
          </span>
        </div>
      )}

      {requiredFieldsCount > 0 && totalCount < requiredFieldsCount && (
        <div className="flex items-start gap-1.5 text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg">
          <HelpCircle className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
          <span>
            You have uploaded {totalCount} of {requiredFieldsCount} required files. Please fill in the remaining personalisation files before proceeding.
          </span>
        </div>
      )}
    </div>
  );
};
