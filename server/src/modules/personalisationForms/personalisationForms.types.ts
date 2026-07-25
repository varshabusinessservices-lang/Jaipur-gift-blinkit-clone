import { z } from 'zod';

export type FieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'EMAIL'
  | 'PHONE'
  | 'WHATSAPP'
  | 'DATE'
  | 'TIME'
  | 'DATE_TIME'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'RADIO'
  | 'CHECKBOX'
  | 'FILE'
  | 'IMAGE'
  | 'MULTI_IMAGE'
  | 'COLOR'
  | 'URL'
  | 'RATING'
  | 'BOOLEAN'
  | 'SIGNATURE'
  | 'MAIN_PHOTO'
  | 'SUPPORTING_PHOTOS'
  | 'PROFILE_PHOTO'
  | 'LOGO'
  | 'QR_IMAGE'
  | 'DOCUMENT';

export type FieldSection =
  | 'Customer Details'
  | 'Photos'
  | 'Message'
  | 'Occasion'
  | 'Delivery Notes';

export type FieldLayout = '1_column' | '2_column' | 'full_width';

export interface FieldCondition {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'empty' | 'not_empty';
  value: string;
}

export interface ImageSettings {
  minImages?: number;
  maxImages?: number;
  maxSizeBytes?: number;
  minResolution?: string; // e.g. "1000x1000"
  allowedFormats?: string[]; // e.g. ["jpg", "png"]
  cropRequired?: boolean;
  backgroundRemovalRequired?: boolean;
  imageQualityCheckEnabled?: boolean;
  previewUrl?: string;
}

export interface TextValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex
  onlyNumbers?: boolean;
  onlyLetters?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  trim?: boolean;
}

export interface NumberValidation {
  min?: number;
  max?: number;
  decimal?: boolean;
  integer?: boolean;
}

export interface DateValidation {
  minDate?: string;
  maxDate?: string;
  futureAllowed?: boolean;
  pastAllowed?: boolean;
}

export interface PhoneValidation {
  countryCode?: string;
  length?: number;
  otpRequired?: boolean;
}

export interface FieldSettings {
  section?: FieldSection;
  layout?: FieldLayout;
  options?: { label: string; value: string }[];
  conditions?: FieldCondition[];
  imageSettings?: ImageSettings;
}

export interface FieldValidation {
  text?: TextValidation;
  number?: NumberValidation;
  date?: DateValidation;
  phone?: PhoneValidation;
  whatsapp?: {
    isWhatsApp?: boolean;
    required?: boolean;
    defaultForAllForms?: boolean;
  };
}

export interface PersonalisationField {
  id: string;
  formId: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  fieldType: FieldType;
  required: boolean;
  sortOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
  validationJson: FieldValidation;
  settingsJson: FieldSettings;
}

export interface PersonalisationForm {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  fields: PersonalisationField[];
}

export interface FormAssignment {
  id: string;
  formId: string;
  productId?: string;
  variationId?: string;
  createdAt: string;
}

// Zod schemas for input validation
export const FieldConditionSchema = z.object({
  fieldId: z.string(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'empty', 'not_empty']),
  value: z.string(),
});

export const ImageSettingsSchema = z.object({
  minImages: z.number().optional(),
  maxImages: z.number().optional(),
  maxSizeBytes: z.number().optional(),
  minResolution: z.string().optional(),
  allowedFormats: z.array(z.string()).optional(),
  cropRequired: z.boolean().optional(),
  backgroundRemovalRequired: z.boolean().optional(),
  imageQualityCheckEnabled: z.boolean().optional(),
  previewUrl: z.string().optional(),
});

export const TextValidationSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  onlyNumbers: z.boolean().optional(),
  onlyLetters: z.boolean().optional(),
  uppercase: z.boolean().optional(),
  lowercase: z.boolean().optional(),
  trim: z.boolean().optional(),
});

export const NumberValidationSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  decimal: z.boolean().optional(),
  integer: z.boolean().optional(),
});

export const DateValidationSchema = z.object({
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
  futureAllowed: z.boolean().optional(),
  pastAllowed: z.boolean().optional(),
});

export const PhoneValidationSchema = z.object({
  countryCode: z.string().optional(),
  length: z.number().optional(),
  otpRequired: z.boolean().optional(),
});

export const FieldSettingsSchema = z.object({
  section: z.enum(['Customer Details', 'Photos', 'Message', 'Occasion', 'Delivery Notes']).optional(),
  layout: z.enum(['1_column', '2_column', 'full_width']).optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  conditions: z.array(FieldConditionSchema).optional(),
  imageSettings: ImageSettingsSchema.optional(),
});

export const FieldValidationSchema = z.object({
  text: TextValidationSchema.optional(),
  number: NumberValidationSchema.optional(),
  date: DateValidationSchema.optional(),
  phone: PhoneValidationSchema.optional(),
  whatsapp: z.object({
    isWhatsApp: z.boolean().optional(),
    required: z.boolean().optional(),
    defaultForAllForms: z.boolean().optional(),
  }).optional(),
});

export const FieldInputSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Label is required'),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  fieldType: z.string(),
  required: z.boolean().default(false),
  sortOrder: z.number().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  validationJson: FieldValidationSchema.default({}),
  settingsJson: FieldSettingsSchema.default({}),
});

export const FormInputSchema = z.object({
  name: z.string().min(2, 'Form name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  fields: z.array(FieldInputSchema).default([]),
});

export const GlobalWhatsAppSettingSchema = z.object({
  requireWhatsAppForSharedPersonalisation: z.boolean(),
});
