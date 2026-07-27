import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileSelect,
  accept = 'image/*',
  maxSizeMB = 10,
  disabled = false,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateAndSelectFile = (file: File) => {
    setError(null);
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      setError(`File size exceeds the ${maxSizeMB}MB limit.`);
      return;
    }

    // Basic type validation
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    const fileType = file.type;
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

    const isAccepted = acceptedTypes.some((type) => {
      if (type === '*/*') return true;
      if (type.endsWith('/*')) {
        const prefix = type.split('/')[0];
        return fileType.startsWith(`${prefix}/`);
      }
      return fileType === type || fileExtension === type;
    });

    if (!isAccepted) {
      setError(`Unsupported file format. Please upload: ${accept}`);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        id="upload-dropzone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none ${
          disabled
            ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
            : isDragActive
            ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99] shadow-inner'
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div className={`p-4 bg-slate-100 rounded-full mb-4 text-slate-500 ${isDragActive ? 'text-indigo-500 bg-indigo-100' : ''}`}>
          <UploadCloud className="h-6 w-6" />
        </div>

        <p className="text-sm font-semibold text-slate-800 mb-1">
          {isDragActive ? 'Drop your file here!' : 'Click to upload or drag & drop'}
        </p>
        <p className="text-xs text-slate-400 mb-3">
          Supports image types and documents up to {maxSizeMB}MB
        </p>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 max-w-md mt-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium text-left">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
