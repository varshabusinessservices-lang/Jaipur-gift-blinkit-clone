import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { ValidationResult } from '../types/customerUploads';

interface UploadValidationMessageProps {
  validationResult: ValidationResult | null;
  fileName?: string;
}

export const UploadValidationMessage: React.FC<UploadValidationMessageProps> = ({
  validationResult,
  fileName,
}) => {
  if (!validationResult) return null;

  const { valid, flags = [], dimensions } = validationResult;

  if (valid) {
    return (
      <div id="validation-message-success" className="flex items-start gap-2 text-xs text-green-700 bg-green-50/50 p-3 rounded-lg border border-green-100">
        <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold">Excellent Quality</p>
          <p className="text-green-600">
            {fileName ? `"${fileName}"` : 'This file'} meets all size and quality requirements for pristine printing.
            {dimensions && ` (${dimensions.width}x${dimensions.height} px)`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="validation-message-warnings" className="space-y-2">
      {flags.map((flag, idx) => {
        let title = 'Validation warning';
        let desc = 'There is an issue with the quality of this file.';
        let isCritical = false;

        if (flag === 'RESOLUTION_TOO_LOW') {
          title = 'Low Resolution Warning';
          desc = 'This image is below 1000px. Printing it might result in a pixelated or blurry gift product.';
          isCritical = false;
        } else if (flag === 'FILE_SIZE_TOO_LARGE') {
          title = 'File Too Large';
          desc = 'The file exceeds the recommended upload limit.';
          isCritical = true;
        } else if (flag === 'FORMAT_UNSUPPORTED') {
          title = 'Unsupported Format';
          desc = 'This file format is not recommended for personalized product engraving/printing.';
          isCritical = true;
        } else if (flag === 'ASPECT_RATIO_MISMATCH') {
          title = 'Aspect Ratio Mismatch';
          desc = 'The shape of your photo doesn\'t match the target placeholder. It will be cropped or padded.';
          isCritical = false;
        }

        return (
          <div
            key={idx}
            className={`flex items-start gap-2 text-xs p-3 rounded-lg border ${
              isCritical
                ? 'text-red-700 bg-red-50/50 border-red-150'
                : 'text-amber-700 bg-amber-50/50 border-amber-150'
            }`}
          >
            <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${isCritical ? 'text-red-500' : 'text-amber-500'}`} />
            <div className="space-y-0.5 text-left">
              <p className="font-semibold">{title}</p>
              <p className={isCritical ? 'text-red-600' : 'text-amber-600'}>{desc}</p>
            </div>
          </div>
        );
      })}

      {dimensions && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 px-3 py-1 bg-slate-50 rounded-md border border-slate-100 max-w-max">
          <Info className="h-3.5 w-3.5" />
          <span>Detected dimensions: {dimensions.width} x {dimensions.height} px (Aspect ratio: {dimensions.aspectRatio})</span>
        </div>
      )}
    </div>
  );
};
