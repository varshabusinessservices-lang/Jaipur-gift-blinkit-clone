import React from 'react';
import { Trash2, AlertTriangle, FileText, Lock, CheckCircle2 } from 'lucide-react';
import { CustomerUpload } from '../types/customerUploads';

interface ImagePreviewCardProps {
  upload: CustomerUpload;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export const ImagePreviewCard: React.FC<ImagePreviewCardProps> = ({
  upload,
  onDelete,
  showDelete = true,
}) => {
  const isImg = upload.mimeType?.startsWith('image/');
  const validationResult = upload.validationResultJson ? JSON.parse(upload.validationResultJson) : null;
  const isInvalid = validationResult ? !validationResult.valid : upload.lifecycleStatus === 'VALIDATION_FAILED';

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const imageUrl = upload.signedUrl || `/api/v1/customer-uploads/view/${upload.id}`;

  return (
    <div
      id={`image-preview-${upload.id}`}
      className="group relative border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full"
    >
      {/* File Preview Area */}
      <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center border-b border-slate-100 overflow-hidden">
        {isImg ? (
          <img
            src={imageUrl}
            alt={upload.originalFileName}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4">
            <FileText className="h-12 w-12 text-slate-300 mb-2" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{upload.extension}</span>
          </div>
        )}

        {/* Floating Icons / Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {upload.isAdminProtected && (
            <span className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm" title="Protected file, cannot be deleted.">
              <Lock className="h-3.5 w-3.5" />
            </span>
          )}

          {isInvalid ? (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold shadow-sm">
              <AlertTriangle className="h-3 w-3" />
              <span>Low Quality</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white rounded-full text-[10px] font-bold shadow-sm">
              <CheckCircle2 className="h-3 w-3" />
              <span>Approved</span>
            </span>
          )}
        </div>

        {/* Delete Trigger Overlay */}
        {showDelete && !upload.isAdminProtected && onDelete && (
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
            <button
              onClick={() => onDelete(upload.id)}
              className="p-3 bg-red-600 text-white hover:bg-red-700 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
              title="Delete uploaded file"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Description Meta Section */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 truncate" title={upload.originalFileName}>
            {upload.originalFileName}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            {formatSize(upload.sizeBytes)} {upload.width && upload.height ? `• ${upload.width}x${upload.height}px` : ''}
          </p>
        </div>

        {upload.isPrimary && (
          <span className="mt-2 text-[9px] font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 max-w-max">
            Primary Photo
          </span>
        )}
      </div>
    </div>
  );
};
