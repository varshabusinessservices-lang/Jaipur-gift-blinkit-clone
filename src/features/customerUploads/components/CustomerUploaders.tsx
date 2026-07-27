import React from 'react';
import { UploadDropzone } from './UploadDropzone';
import { ImagePreviewCard } from './ImagePreviewCard';
import { UploadProgressItem } from './UploadProgressItem';
import { UploadValidationMessage } from './UploadValidationMessage';
import { CustomerUpload, CustomerUploadRole } from '../types/customerUploads';
import { ArrowLeft, ArrowRight, Star, FileText, UploadCloud, FileSpreadsheet, Check } from 'lucide-react';

// ==========================================
// 1. REORDERABLE UPLOAD GRID
// ==========================================
interface ReorderableUploadGridProps {
  uploads: CustomerUpload[];
  onDelete: (id: string) => void;
  onReorder?: (reorderedUploads: CustomerUpload[]) => void;
  onSetPrimary?: (id: string) => void;
}

export const ReorderableUploadGrid: React.FC<ReorderableUploadGridProps> = ({
  uploads,
  onDelete,
  onReorder,
  onSetPrimary,
}) => {
  const handleMove = (index: number, direction: 'left' | 'right') => {
    if (!onReorder) return;
    const newUploads = [...uploads];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= uploads.length) return;

    // Swap
    const temp = newUploads[index];
    newUploads[index] = newUploads[targetIndex];
    newUploads[targetIndex] = temp;

    // Adjust sortOrder indexes
    const updated = newUploads.map((u, i) => ({ ...u, sortOrder: i }));
    onReorder(updated);
  };

  if (uploads.length === 0) return null;

  return (
    <div id="reorderable-upload-grid" className="space-y-2">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your Uploaded Files</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {uploads.map((upload, index) => {
          const isImg = upload.mimeType?.startsWith('image/');
          return (
            <div key={upload.id} className="relative flex flex-col h-full">
              <div className="flex-1">
                <ImagePreviewCard upload={upload} onDelete={onDelete} />
              </div>

              {/* Control Panel underneath each card */}
              <div className="flex items-center justify-between mt-2 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-xs">
                {onSetPrimary && isImg && (
                  <button
                    onClick={() => onSetPrimary(upload.id)}
                    className={`p-1 rounded hover:bg-slate-200 transition-colors cursor-pointer ${upload.isPrimary ? 'text-amber-500 hover:text-amber-600' : 'text-slate-400'}`}
                    title={upload.isPrimary ? 'Primary Photo' : 'Set as Primary'}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                )}

                <div className="flex gap-1 ml-auto">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'left')}
                    className="p-1 rounded hover:bg-slate-250 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    title="Move Left"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={index === uploads.length - 1}
                    onClick={() => handleMove(index, 'right')}
                    className="p-1 rounded hover:bg-slate-250 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    title="Move Right"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 2. SINGLE IMAGE UPLOADER
// ==========================================
interface SingleImageUploaderProps {
  uploads: CustomerUpload[];
  onUpload: (file: File) => Promise<any>;
  onDelete: (id: string) => void;
  role?: CustomerUploadRole;
  disabled?: boolean;
}

export const SingleImageUploader: React.FC<SingleImageUploaderProps> = ({
  uploads,
  onUpload,
  onDelete,
  role = 'MAIN_PHOTO',
  disabled = false,
}) => {
  const activeUpload = uploads[0];

  const handleFileSelect = async (file: File) => {
    await onUpload(file);
  };

  return (
    <div id="single-image-uploader" className="space-y-3">
      {activeUpload ? (
        <div className="max-w-xs">
          <ImagePreviewCard upload={activeUpload} onDelete={onDelete} />
          {activeUpload.validationResultJson && (
            <div className="mt-2">
              <UploadValidationMessage
                validationResult={JSON.parse(activeUpload.validationResultJson)}
                fileName={activeUpload.originalFileName}
              />
            </div>
          )}
        </div>
      ) : (
        <UploadDropzone
          onFileSelect={handleFileSelect}
          accept="image/*"
          maxSizeMB={10}
          disabled={disabled}
        />
      )}
    </div>
  );
};

// ==========================================
// 3. MULTI IMAGE UPLOADER
// ==========================================
interface MultiImageUploaderProps {
  uploads: CustomerUpload[];
  onUpload: (file: File) => Promise<any>;
  onDelete: (id: string) => void;
  onReorder?: (uploads: CustomerUpload[]) => void;
  onSetPrimary?: (id: string) => void;
  maxFiles?: number;
  role?: CustomerUploadRole;
  disabled?: boolean;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  uploads,
  onUpload,
  onDelete,
  onReorder,
  onSetPrimary,
  maxFiles = 10,
  role = 'SUPPORTING_PHOTO',
  disabled = false,
}) => {
  const handleFileSelect = async (file: File) => {
    if (uploads.length >= maxFiles) return;
    await onUpload(file);
  };

  return (
    <div id="multi-image-uploader" className="space-y-4">
      {uploads.length < maxFiles && (
        <UploadDropzone
          onFileSelect={handleFileSelect}
          accept="image/*"
          maxSizeMB={10}
          disabled={disabled}
        />
      )}

      {uploads.length > 0 && (
        <ReorderableUploadGrid
          uploads={uploads}
          onDelete={onDelete}
          onReorder={onReorder}
          onSetPrimary={onSetPrimary}
        />
      )}
    </div>
  );
};

// ==========================================
// 4. DOCUMENT UPLOADER
// ==========================================
interface DocumentUploaderProps {
  uploads: CustomerUpload[];
  onUpload: (file: File) => Promise<any>;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  uploads,
  onUpload,
  onDelete,
  disabled = false,
}) => {
  const handleFileSelect = async (file: File) => {
    await onUpload(file);
  };

  return (
    <div id="document-uploader" className="space-y-3">
      {uploads.length > 0 ? (
        <div className="space-y-2">
          {uploads.map((u) => (
            <div key={u.id} className="max-w-md">
              <UploadProgressItem
                fileName={u.originalFileName}
                sizeBytes={u.sizeBytes}
                status={u.lifecycleStatus === 'VALIDATED' ? 'VALIDATED' : 'FAILED'}
              />
              <button
                onClick={() => onDelete(u.id)}
                className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
              >
                Delete File
              </button>
            </div>
          ))}
        </div>
      ) : (
        <UploadDropzone
          onFileSelect={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
          maxSizeMB={20}
          disabled={disabled}
        />
      )}
    </div>
  );
};

// ==========================================
// 5. PERSONALISATION FILE FIELD
// ==========================================
interface PersonalisationFileFieldProps {
  field: {
    id: string;
    type: string;
    label: string;
    isRequired: boolean;
    helpText?: string;
    validationRules?: any;
  };
  uploads: CustomerUpload[];
  onUpload: (file: File, role: CustomerUploadRole) => Promise<any>;
  onDelete: (id: string) => void;
  onReorder?: (uploads: CustomerUpload[]) => void;
  onSetPrimary?: (id: string) => void;
  disabled?: boolean;
}

export const PersonalisationFileField: React.FC<PersonalisationFileFieldProps> = ({
  field,
  uploads,
  onUpload,
  onDelete,
  onReorder,
  onSetPrimary,
  disabled = false,
}) => {
  // Map field types to appropriate CustomerUploadRoles
  let role: CustomerUploadRole = 'OTHER';
  if (field.type === 'SINGLE_IMAGE') role = 'MAIN_PHOTO';
  if (field.type === 'MULTI_IMAGE') role = 'SUPPORTING_PHOTO';
  if (field.type === 'LOGO') role = 'LOGO';
  if (field.type === 'QR_CODE') role = 'QR_IMAGE';
  if (field.type === 'DOCUMENT') role = 'DOCUMENT';

  const fieldUploads = uploads.filter((u) => u.personalisationFieldId === field.id && !u.isCustomerDeleted);

  return (
    <div id={`personalisation-field-${field.id}`} className="space-y-2 p-5 bg-slate-50/55 rounded-xl border border-slate-150">
      <div className="flex items-center gap-1">
        <label className="text-sm font-bold text-slate-800">
          {field.label}
          {field.isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      </div>

      {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}

      <div className="mt-3">
        {field.type === 'SINGLE_IMAGE' || field.type === 'LOGO' || field.type === 'QR_CODE' ? (
          <SingleImageUploader
            uploads={fieldUploads}
            onUpload={(file) => onUpload(file, role)}
            onDelete={onDelete}
            role={role}
            disabled={disabled}
          />
        ) : field.type === 'MULTI_IMAGE' ? (
          <MultiImageUploader
            uploads={fieldUploads}
            onUpload={(file) => onUpload(file, role)}
            onDelete={onDelete}
            onReorder={onReorder}
            onSetPrimary={onSetPrimary}
            role={role}
            maxFiles={field.validationRules?.maxFiles || 10}
            disabled={disabled}
          />
        ) : field.type === 'DOCUMENT' ? (
          <DocumentUploader
            uploads={fieldUploads}
            onUpload={(file) => onUpload(file, role)}
            onDelete={onDelete}
            disabled={disabled}
          />
        ) : (
          <p className="text-xs text-red-600">Unsupported field type: {field.type}</p>
        )}
      </div>
    </div>
  );
};
