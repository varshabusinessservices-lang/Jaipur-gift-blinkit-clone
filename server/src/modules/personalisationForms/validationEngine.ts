import { PersonalisationForm, PersonalisationField } from './personalisationForms.types';

export interface ValidationError {
  fieldId: string;
  label: string;
  message: string;
}

/**
 * Validates a personalisation form submission payload against the form schema rules
 */
export function validatePersonalisationSubmission(
  form: PersonalisationForm,
  submissionData: Record<string, any>,
  globalSettings?: { requireWhatsAppForAllPersonalisedProducts: boolean }
): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const requireWhatsAppGlobal = globalSettings?.requireWhatsAppForAllPersonalisedProducts !== false;

  form.fields.forEach((field) => {
    const value = submissionData[field.id];
    const isPresent = value !== undefined && value !== null && value !== '';

    // Check WhatsApp special global mandate
    const isWhatsAppField = field.fieldType === 'WHATSAPP' || field.validationJson?.whatsapp?.isWhatsApp;

    // 1. Check Required status
    let isRequired = field.required;
    
    // If it's a WhatsApp field and global require is active, force required
    if (isWhatsAppField && requireWhatsAppGlobal) {
      isRequired = true;
    }

    if (isRequired && !isPresent) {
      errors.push({
        fieldId: field.id,
        label: field.label,
        message: `${field.label} is required.`,
      });
      return; // Skip other validations for this field since it's missing
    }

    // If optional and not present, skip further validation
    if (!isPresent) {
      return;
    }

    // 2. Field Type Validations
    const fieldType = field.fieldType;

    // A. TEXT and TEXTAREA validations
    if (fieldType === 'TEXT' || fieldType === 'TEXTAREA') {
      const textVal = String(value);
      const rules = field.validationJson?.text;

      if (rules) {
        if (rules.trim && textVal.trim() === '') {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} cannot be empty.`,
          });
          return;
        }

        const cleanVal = rules.trim ? textVal.trim() : textVal;

        if (rules.minLength !== undefined && cleanVal.length < rules.minLength) {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} must be at least ${rules.minLength} characters.`,
          });
        }

        if (rules.maxLength !== undefined && cleanVal.length > rules.maxLength) {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} cannot exceed ${rules.maxLength} characters.`,
          });
        }

        if (rules.onlyNumbers && !/^\d+$/.test(cleanVal)) {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} must contain only numbers.`,
          });
        }

        if (rules.onlyLetters && !/^[A-Za-z\s]+$/.test(cleanVal)) {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} must contain only letters.`,
          });
        }

        if (rules.uppercase && cleanVal !== cleanVal.toUpperCase()) {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} must be uppercase.`,
          });
        }

        if (rules.lowercase && cleanVal !== cleanVal.toLowerCase()) {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} must be lowercase.`,
          });
        }

        if (rules.pattern) {
          try {
            const regex = new RegExp(rules.pattern);
            if (!regex.test(cleanVal)) {
              errors.push({
                fieldId: field.id,
                label: field.label,
                message: `${field.label} format is invalid.`,
              });
            }
          } catch (e) {
            // Bad regex ignore
          }
        }
      }
    }

    // B. NUMBER validations
    if (fieldType === 'NUMBER') {
      const numVal = Number(value);
      if (isNaN(numVal)) {
        errors.push({
          fieldId: field.id,
          label: field.label,
          message: `${field.label} must be a number.`,
        });
        return;
      }

      const rules = field.validationJson?.number;
      if (rules) {
        if (rules.min !== undefined && numVal < rules.min) {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} must be at least ${rules.min}.`,
          });
        }

        if (rules.max !== undefined && numVal > rules.max) {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} cannot exceed ${rules.max}.`,
          });
        }

        if (rules.integer && !Number.isInteger(numVal)) {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} must be an integer.`,
          });
        }

        if (rules.decimal && Number.isInteger(numVal)) {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} must contain decimal digits.`,
          });
        }
      }
    }

    // C. DATE validations
    if (fieldType === 'DATE' || fieldType === 'DATE_TIME') {
      const dateVal = new Date(value);
      if (isNaN(dateVal.getTime())) {
        errors.push({
          fieldId: field.id,
          label: field.label,
          message: `${field.label} is an invalid date.`,
        });
        return;
      }

      const rules = field.validationJson?.date;
      if (rules) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const compareDate = new Date(dateVal);
        compareDate.setHours(0, 0, 0, 0);

        if (rules.futureAllowed === false && compareDate > today) {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} cannot be a future date.`,
          });
        }

        if (rules.pastAllowed === false && compareDate < today) {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} cannot be a past date.`,
          });
        }

        if (rules.minDate) {
          const minD = new Date(rules.minDate);
          if (!isNaN(minD.getTime()) && compareDate < minD) {
            errors.push({
              fieldId: field.id,
              label: field.label,
              message: `${field.label} must be after ${rules.minDate}.`,
            });
          }
        }

        if (rules.maxDate) {
          const maxD = new Date(rules.maxDate);
          if (!isNaN(maxD.getTime()) && compareDate > maxD) {
            errors.push({
              fieldId: field.id,
              label: field.label,
              message: `${field.label} must be before ${rules.maxDate}.`,
            });
          }
        }
      }
    }

    // D. PHONE and WHATSAPP validations
    if (fieldType === 'PHONE' || fieldType === 'WHATSAPP') {
      const phoneVal = String(value).replace(/\D/g, ''); // strip non-numeric
      const rules = field.validationJson?.phone;

      if (rules) {
        if (rules.length !== undefined && phoneVal.length !== rules.length) {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} must be exactly ${rules.length} digits.`,
          });
        }
      } else {
        // Fallback default validation: should be a valid phone number, e.g. 10 digits
        if (phoneVal.length < 10 || phoneVal.length > 15) {
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `${field.label} must be a valid phone number (10-15 digits).`,
          });
        }
      }
    }

    // E. URL validations
    if (fieldType === 'URL') {
      try {
        new URL(String(value));
      } catch (e) {
        errors.push({
          fieldId: field.id,
          label: field.label,
          message: `${field.label} must be a valid URL.`,
        });
      }
    }

    // F. EMAIL validations
    if (fieldType === 'EMAIL') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(String(value))) {
        errors.push({
          fieldId: field.id,
          label: field.label,
          message: `${field.label} must be a valid email address.`,
        });
      }
    }

    // G. IMAGE / FILE and SPECIAL PERSONALISED IMAGE TYPES
    const fileFields = [
      'FILE', 'IMAGE', 'MULTI_IMAGE',
      'MAIN_PHOTO', 'SUPPORTING_PHOTOS', 'PROFILE_PHOTO', 'LOGO', 'QR_IMAGE', 'DOCUMENT'
    ];

    if (fileFields.includes(fieldType)) {
      // Expect array of files or a single file object, or string references
      let filesArray: any[] = [];
      if (Array.isArray(value)) {
        filesArray = value;
      } else if (value) {
        filesArray = [value];
      }

      const imgSettings = field.settingsJson?.imageSettings;
      
      // Determine limits
      let minImg = imgSettings?.minImages;
      let maxImg = imgSettings?.maxImages;

      // Special presets based on examples:
      if (fieldType === 'MAIN_PHOTO' || fieldType === 'PROFILE_PHOTO' || fieldType === 'LOGO' || fieldType === 'QR_IMAGE') {
        if (minImg === undefined) minImg = 1;
        if (maxImg === undefined) maxImg = 1;
      } else if (fieldType === 'SUPPORTING_PHOTOS') {
        if (minImg === undefined) minImg = 5;
        if (maxImg === undefined) maxImg = 20;
      }

      if (minImg !== undefined && filesArray.length < minImg) {
        errors.push({
          fieldId: field.id,
          label: field.label,
          message: `${field.label} requires at least ${minImg} photo(s)/file(s).`,
        });
      }

      if (maxImg !== undefined && filesArray.length > maxImg) {
        errors.push({
          fieldId: field.id,
          label: field.label,
          message: `${field.label} cannot exceed ${maxImg} photo(s)/file(s).`,
        });
      }

      // Check size limit if available
      if (imgSettings?.maxSizeBytes) {
        const exceedsSize = filesArray.some((file) => {
          if (file && typeof file === 'object' && file.size > imgSettings.maxSizeBytes!) {
            return true;
          }
          return false;
        });

        if (exceedsSize) {
          const mbSize = (imgSettings.maxSizeBytes / (1024 * 1024)).toFixed(1);
          errors.push({
            fieldId: field.id,
            label: field.label,
            message: `One or more files exceed the maximum size of ${mbSize} MB.`,
          });
        }
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
