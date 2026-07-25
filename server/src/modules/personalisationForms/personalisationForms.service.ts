import { PersonalisationFormRepository } from './personalisationForms.repository';
import { PersonalisationForm, PersonalisationField, FieldType, FormInputSchema, GlobalWhatsAppSettingSchema } from './personalisationForms.types';
import { validatePersonalisationSubmission } from './validationEngine';

export class PersonalisationFormService {
  constructor(private repository: PersonalisationFormRepository = new PersonalisationFormRepository()) {}

  async listForms() {
    return this.repository.findAll();
  }

  async getFormById(id: string, version?: number) {
    const form = await this.repository.findById(id, version);
    if (!form) {
      const err = new Error('Personalisation Form not found') as any;
      err.statusCode = 404;
      throw err;
    }
    return form;
  }

  async getFormBySlug(slug: string) {
    const form = await this.repository.findBySlug(slug);
    if (!form) {
      const err = new Error('Personalisation Form not found') as any;
      err.statusCode = 404;
      throw err;
    }
    return form;
  }

  async createForm(input: any) {
    // Validate schema
    const parsed = FormInputSchema.parse(input);

    const slug =
      parsed.slug ||
      parsed.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const existingSlug = await this.repository.findBySlug(slug);
    if (existingSlug) {
      const err = new Error(`Form with slug "${slug}" already exists`) as any;
      err.statusCode = 409;
      throw err;
    }

    const formId = `form-${Math.random().toString(36).substr(2, 9)}`;
    const fields: PersonalisationField[] = (parsed.fields || []).map((field, idx) => ({
      ...field,
      fieldType: field.fieldType as FieldType,
      id: field.id || `field-${formId}-${Math.random().toString(36).substr(2, 9)}`,
      formId,
      sortOrder: field.sortOrder !== undefined ? field.sortOrder : idx + 1,
      status: field.status || 'ACTIVE',
      validationJson: field.validationJson || {},
      settingsJson: field.settingsJson || {},
    }));

    const newForm: Omit<PersonalisationForm, 'createdAt' | 'updatedAt'> = {
      id: formId,
      name: parsed.name.trim(),
      slug,
      description: parsed.description || '',
      status: parsed.status,
      version: 1,
      fields,
    };

    return this.repository.create(newForm as any);
  }

  async updateForm(id: string, input: any) {
    // Retrieve original form to check existence
    await this.getFormById(id);

    const parsed = FormInputSchema.parse(input);

    // If slug is updated, verify unique
    if (parsed.slug) {
      const existing = await this.repository.findBySlug(parsed.slug);
      if (existing && existing.id !== id) {
        const err = new Error(`Form with slug "${parsed.slug}" already exists`) as any;
        err.statusCode = 409;
        throw err;
      }
    }

    const updatedFields: Partial<PersonalisationForm> = {
      name: parsed.name.trim(),
      slug: parsed.slug,
      description: parsed.description,
      status: parsed.status,
      fields: parsed.fields as any,
    };

    return this.repository.update(id, updatedFields);
  }

  async deleteForm(id: string) {
    const success = await this.repository.delete(id);
    if (!success) {
      const err = new Error('Form not found or already deleted') as any;
      err.statusCode = 404;
      throw err;
    }
    return { success: true };
  }

  async duplicateForm(id: string) {
    const origin = await this.getFormById(id);
    const newSlug = `${origin.slug}-copy-${Math.random().toString(36).substr(2, 4)}`;
    return this.repository.duplicateForm(id, newSlug);
  }

  async duplicateField(formId: string, fieldId: string) {
    return this.repository.duplicateField(formId, fieldId);
  }

  async reorderFields(formId: string, fieldIds: string[]) {
    return this.repository.reorderFields(formId, fieldIds);
  }

  // Assignments
  async assignFormToProduct(formId: string, productId: string) {
    return this.repository.assignFormToProduct(formId, productId);
  }

  async assignFormToVariation(formId: string, variationId: string) {
    return this.repository.assignFormToVariation(formId, variationId);
  }

  async removeAssignment(productId?: string, variationId?: string) {
    return this.repository.removeAssignment(productId, variationId);
  }

  async getAssignmentForProduct(productId: string) {
    return this.repository.getAssignmentForProduct(productId);
  }

  async getAssignmentForVariation(variationId: string) {
    return this.repository.getAssignmentForVariation(variationId);
  }

  // Global settings
  async getGlobalSettings() {
    return this.repository.getGlobalSettings();
  }

  async updateGlobalSettings(settings: { requireWhatsAppForAllPersonalisedProducts: boolean }) {
    return this.repository.updateGlobalSettings(settings);
  }

  // Validate Submission
  async validateSubmission(formId: string, submissionData: Record<string, any>, version?: number) {
    const form = await this.getFormById(formId, version);
    const globalSettings = await this.getGlobalSettings();
    return validatePersonalisationSubmission(form, submissionData, globalSettings);
  }
}
