import React from 'react';
import { Loader2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface UploadProgressItemProps {
  fileName: string;
  sizeBytes: number;
  progress?: number;
  status: 'UPLOADING' | 'VALIDATION_FAILED' | 'VALIDATED' | 'FAILED';
  error?: string;
}

export const UploadProgressItem: React.FC<UploadProgressItemProps> = ({
  fileName,
  sizeBytes,
  progress = 0,
  status,
  error,
}) => {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div id="upload-progress-item" className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center shrink-0">
        <FileText className="h-5 w-5 text-slate-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-slate-800 truncate" title={fileName}>
            {fileName}
          </p>
          <span className="text-[11px] font-medium text-slate-400 shrink-0">
            {formatSize(sizeBytes)}
          </span>
        </div>

        {status === 'UPLOADING' && (
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Uploading... {progress}%</span>
            </div>
          </div>
        )}

        {status === 'VALIDATED' && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-green-600 mt-1">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>Success: Validated & secure</span>
          </div>
        )}

        {status === 'VALIDATION_FAILED' && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 mt-1">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Warning: {error || 'Quality warnings found'}</span>
          </div>
        )}

        {status === 'FAILED' && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-red-600 mt-1">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Error: {error || 'Upload failed'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
