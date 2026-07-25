import fs from 'fs';
import path from 'path';
import { PersonalisationForm, PersonalisationField, FormAssignment, GlobalWhatsAppSettingSchema } from './personalisationForms.types';

const DB_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'personalisationForms', 'personalisationForms.json');

// Ensure parent directory exists
const dir = path.dirname(DB_FILE);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const defaultGlobalSettings = {
  requireWhatsAppForAllPersonalisedProducts: true,
};

// Generates the initial beautiful mock forms requested
const getSeededForms = (): PersonalisationForm[] => {
  return [
    {
      id: 'form-baby-frame',
      name: 'Baby Birth Frame Form',
      slug: 'baby-birth-frame-form',
      description: 'Collect details for custom-designed Baby Birth Frame including photos, birth statistics, and family names.',
      status: 'ACTIVE',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: [
        {
          id: 'field-baby-name',
          formId: 'form-baby-frame',
          label: 'Baby\'s Full Name',
          placeholder: 'Enter baby\'s name',
          helpText: 'Ensure correct spelling as this is printed on the frame',
          fieldType: 'TEXT',
          required: true,
          sortOrder: 1,
          status: 'ACTIVE',
          validationJson: {
            text: { minLength: 2, maxLength: 50, trim: true }
          },
          settingsJson: {
            section: 'Customer Details',
            layout: '2_column'
          }
        },
        {
          id: 'field-baby-dob',
          formId: 'form-baby-frame',
          label: 'Date of Birth',
          placeholder: 'Select baby\'s birth date',
          helpText: 'Date of birth',
          fieldType: 'DATE',
          required: true,
          sortOrder: 2,
          status: 'ACTIVE',
          validationJson: {
            date: { pastAllowed: true, futureAllowed: false }
          },
          settingsJson: {
            section: 'Customer Details',
            layout: '2_column'
          }
        },
        {
          id: 'field-baby-time',
          formId: 'form-baby-frame',
          label: 'Birth Time',
          placeholder: 'e.g. 09:45 AM',
          helpText: 'Time of birth',
          fieldType: 'TIME',
          required: true,
          sortOrder: 3,
          status: 'ACTIVE',
          validationJson: {},
          settingsJson: {
            section: 'Customer Details',
            layout: '2_column'
          }
        },
        {
          id: 'field-baby-weight',
          formId: 'form-baby-frame',
          label: 'Birth Weight (kg/grams)',
          placeholder: 'e.g. 3.2 kg',
          helpText: 'Weight at the time of birth',
          fieldType: 'TEXT',
          required: true,
          sortOrder: 4,
          status: 'ACTIVE',
          validationJson: {
            text: { maxLength: 20, trim: true }
          },
          settingsJson: {
            section: 'Customer Details',
            layout: '2_column'
          }
        },
        {
          id: 'field-hospital-name',
          formId: 'form-baby-frame',
          label: 'Hospital Name',
          placeholder: 'e.g. City Maternity Hospital',
          helpText: 'Optional clinic or hospital name',
          fieldType: 'TEXT',
          required: false,
          sortOrder: 5,
          status: 'ACTIVE',
          validationJson: {
            text: { trim: true }
          },
          settingsJson: {
            section: 'Customer Details',
            layout: 'full_width'
          }
        },
        {
          id: 'field-mother-name',
          formId: 'form-baby-frame',
          label: 'Mother\'s Name',
          placeholder: 'Mother\'s full name',
          fieldType: 'TEXT',
          required: true,
          sortOrder: 6,
          status: 'ACTIVE',
          validationJson: {
            text: { minLength: 2, maxLength: 50, trim: true }
          },
          settingsJson: {
            section: 'Customer Details',
            layout: '2_column'
          }
        },
        {
          id: 'field-father-name',
          formId: 'form-baby-frame',
          label: 'Father\'s Name',
          placeholder: 'Father\'s full name',
          fieldType: 'TEXT',
          required: true,
          sortOrder: 7,
          status: 'ACTIVE',
          validationJson: {
            text: { minLength: 2, maxLength: 50, trim: true }
          },
          settingsJson: {
            section: 'Customer Details',
            layout: '2_column'
          }
        },
        {
          id: 'field-doctor-name',
          formId: 'form-baby-frame',
          label: 'Doctor\'s Name',
          placeholder: 'Doctor or obstetrician',
          fieldType: 'TEXT',
          required: false,
          sortOrder: 8,
          status: 'ACTIVE',
          validationJson: {
            text: { trim: true }
          },
          settingsJson: {
            section: 'Customer Details',
            layout: '2_column'
          }
        },
        {
          id: 'field-baby-main-photo',
          formId: 'form-baby-frame',
          label: '1 Main Baby Photo',
          helpText: 'High resolution close-up photo of the baby. Recommended min. 1000x1000px.',
          fieldType: 'MAIN_PHOTO',
          required: true,
          sortOrder: 9,
          status: 'ACTIVE',
          validationJson: {},
          settingsJson: {
            section: 'Photos',
            layout: 'full_width',
            imageSettings: {
              minImages: 1,
              maxImages: 1,
              maxSizeBytes: 10 * 1024 * 1024,
              minResolution: '1000x1000',
              allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
              cropRequired: true,
              backgroundRemovalRequired: false,
              imageQualityCheckEnabled: true
            }
          }
        },
        {
          id: 'field-baby-supporting-photos',
          formId: 'form-baby-frame',
          label: 'Supporting Baby Photos',
          helpText: 'Provide 5 to 20 supporting photos to design the frame grid background.',
          fieldType: 'SUPPORTING_PHOTOS',
          required: true,
          sortOrder: 10,
          status: 'ACTIVE',
          validationJson: {},
          settingsJson: {
            section: 'Photos',
            layout: 'full_width',
            imageSettings: {
              minImages: 5,
              maxImages: 20,
              maxSizeBytes: 5 * 1024 * 1024,
              minResolution: '600x600',
              allowedFormats: ['jpg', 'jpeg', 'png'],
              cropRequired: false,
              imageQualityCheckEnabled: true
            }
          }
        },
        {
          id: 'field-baby-whatsapp',
          formId: 'form-baby-frame',
          label: 'WhatsApp Number for Design Approval',
          placeholder: 'Enter 10-digit WhatsApp number',
          helpText: 'We will share draft designs on this number for approval before printing.',
          fieldType: 'WHATSAPP',
          required: true,
          sortOrder: 11,
          status: 'ACTIVE',
          validationJson: {
            phone: { countryCode: '+91', length: 10 },
            whatsapp: { isWhatsApp: true, required: true }
          },
          settingsJson: {
            section: 'Customer Details',
            layout: 'full_width'
          }
        }
      ]
    },
    {
      id: 'form-photo-mosaic',
      name: 'Photo Mosaic Form',
      slug: 'photo-mosaic-form',
      description: 'Create a massive photographic collage mosaic using 1 central highlight image and 50 secondary supporting grid photos.',
      status: 'ACTIVE',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: [
        {
          id: 'field-mosaic-main',
          formId: 'form-photo-mosaic',
          label: 'Main Central Portrait Photo',
          helpText: 'This will form the central prominent image visible over the collage. Upload 1 high-resolution photo.',
          fieldType: 'MAIN_PHOTO',
          required: true,
          sortOrder: 1,
          status: 'ACTIVE',
          validationJson: {},
          settingsJson: {
            section: 'Photos',
            layout: 'full_width',
            imageSettings: {
              minImages: 1,
              maxImages: 1,
              maxSizeBytes: 20 * 1024 * 1024,
              minResolution: '2000x2000',
              allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
              cropRequired: true,
              backgroundRemovalRequired: false,
              imageQualityCheckEnabled: true
            }
          }
        },
        {
          id: 'field-mosaic-supporting',
          formId: 'form-photo-mosaic',
          label: 'Supporting Mosaic Photos (50 required)',
          helpText: 'Provide exactly 50 supporting images to render the underlying mosaic tile grid.',
          fieldType: 'SUPPORTING_PHOTOS',
          required: true,
          sortOrder: 2,
          status: 'ACTIVE',
          validationJson: {},
          settingsJson: {
            section: 'Photos',
            layout: 'full_width',
            imageSettings: {
              minImages: 50,
              maxImages: 100,
              maxSizeBytes: 5 * 1024 * 1024,
              allowedFormats: ['jpg', 'jpeg', 'png'],
              imageQualityCheckEnabled: false
            }
          }
        },
        {
          id: 'field-mosaic-text',
          formId: 'form-photo-mosaic',
          label: 'Custom Greeting/Quote Text',
          placeholder: 'e.g. Happy 25th Wedding Anniversary Mom & Dad!',
          helpText: 'Printed on the bottom card border of the mosaic frame.',
          fieldType: 'TEXTAREA',
          required: false,
          sortOrder: 3,
          status: 'ACTIVE',
          validationJson: {
            text: { maxLength: 200, trim: true }
          },
          settingsJson: {
            section: 'Message',
            layout: 'full_width'
          }
        },
        {
          id: 'field-mosaic-whatsapp',
          formId: 'form-photo-mosaic',
          label: 'WhatsApp Number for Layout Signoff',
          placeholder: 'WhatsApp number',
          fieldType: 'WHATSAPP',
          required: true,
          sortOrder: 4,
          status: 'ACTIVE',
          validationJson: {
            phone: { countryCode: '+91', length: 10 },
            whatsapp: { isWhatsApp: true, required: true }
          },
          settingsJson: {
            section: 'Customer Details',
            layout: 'full_width'
          }
        }
      ]
    },
    {
      id: 'form-spotify-frame',
      name: 'Spotify Frame Form',
      slug: 'spotify-frame-form',
      description: 'Personalised glass plaque with song details, a scannable Spotify track/playlist code, and a custom photo cover.',
      status: 'ACTIVE',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: [
        {
          id: 'field-spotify-song',
          formId: 'form-spotify-frame',
          label: 'Song Title',
          placeholder: 'e.g. Perfect',
          fieldType: 'TEXT',
          required: true,
          sortOrder: 1,
          status: 'ACTIVE',
          validationJson: {
            text: { minLength: 1, maxLength: 100, trim: true }
          },
          settingsJson: {
            section: 'Customer Details',
            layout: '2_column'
          }
        },
        {
          id: 'field-spotify-artist',
          formId: 'form-spotify-frame',
          label: 'Artist Name(s)',
          placeholder: 'e.g. Ed Sheeran',
          fieldType: 'TEXT',
          required: true,
          sortOrder: 2,
          status: 'ACTIVE',
          validationJson: {
            text: { minLength: 1, maxLength: 100, trim: true }
          },
          settingsJson: {
            section: 'Customer Details',
            layout: '2_column'
          }
        },
        {
          id: 'field-spotify-url',
          formId: 'form-spotify-frame',
          label: 'Spotify Track or Playlist Link',
          placeholder: 'e.g. https://open.spotify.com/track/...',
          helpText: 'Used to generate the unique scannable play code on your frame.',
          fieldType: 'URL',
          required: true,
          sortOrder: 3,
          status: 'ACTIVE',
          validationJson: {},
          settingsJson: {
            section: 'Customer Details',
            layout: 'full_width'
          }
        },
        {
          id: 'field-spotify-image',
          formId: 'form-spotify-frame',
          label: 'Album Art / Custom Image Cover',
          helpText: 'This photo will replace the standard album cover art on the acrylic plaque.',
          fieldType: 'IMAGE',
          required: true,
          sortOrder: 4,
          status: 'ACTIVE',
          validationJson: {},
          settingsJson: {
            section: 'Photos',
            layout: 'full_width',
            imageSettings: {
              minImages: 1,
              maxImages: 1,
              maxSizeBytes: 8 * 1024 * 1024,
              minResolution: '800x800',
              allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
              cropRequired: true,
              imageQualityCheckEnabled: true
            }
          }
        },
        {
          id: 'field-spotify-qr',
          formId: 'form-spotify-frame',
          label: 'Optional Dedicated Custom QR Code Image',
          helpText: 'Upload a custom design qr image if you have a pre-generated custom QR code.',
          fieldType: 'QR_IMAGE',
          required: false,
          sortOrder: 5,
          status: 'ACTIVE',
          validationJson: {},
          settingsJson: {
            section: 'Photos',
            layout: 'full_width',
            imageSettings: {
              minImages: 1,
              maxImages: 1,
              maxSizeBytes: 4 * 1024 * 1024,
              allowedFormats: ['png', 'jpg'],
              cropRequired: false
            }
          }
        },
        {
          id: 'field-spotify-whatsapp',
          formId: 'form-spotify-frame',
          label: 'WhatsApp Number for Audio-Verification Link',
          placeholder: '10-digit mobile number',
          fieldType: 'WHATSAPP',
          required: true,
          sortOrder: 6,
          status: 'ACTIVE',
          validationJson: {
            phone: { length: 10 },
            whatsapp: { isWhatsApp: true, required: true }
          },
          settingsJson: {
            section: 'Customer Details',
            layout: 'full_width'
          }
        }
      ]
    }
  ];
};

export class PersonalisationFormRepository {
  private getDbData(): { forms: PersonalisationForm[]; history: PersonalisationForm[]; assignments: FormAssignment[]; globalSettings: typeof defaultGlobalSettings } {
    if (!fs.existsSync(DB_FILE)) {
      const initial = {
        forms: getSeededForms(),
        history: [],
        assignments: [],
        globalSettings: defaultGlobalSettings,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      // Fallback in case of corruption
      const initial = {
        forms: getSeededForms(),
        history: [],
        assignments: [],
        globalSettings: defaultGlobalSettings,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
  }

  private saveDbData(data: any) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  }

  async findAll(): Promise<PersonalisationForm[]> {
    const data = this.getDbData();
    return data.forms.filter((f: any) => !f.deletedAt);
  }

  async findById(id: string, version?: number): Promise<PersonalisationForm | null> {
    const data = this.getDbData();
    if (version !== undefined) {
      // Check history first for specific version
      const hist = data.history.find((f: any) => f.id === id && f.version === version);
      if (hist) return hist;
      // Fallback to active forms if version matches
      const active = data.forms.find((f: any) => f.id === id && f.version === version);
      if (active) return active;
      return null;
    }
    const found = data.forms.find((f: any) => f.id === id && !f.deletedAt);
    return found || null;
  }

  async findBySlug(slug: string): Promise<PersonalisationForm | null> {
    const data = this.getDbData();
    const found = data.forms.find((f: any) => f.slug === slug && !f.deletedAt);
    return found || null;
  }

  async create(form: Omit<PersonalisationForm, 'createdAt' | 'updatedAt'>): Promise<PersonalisationForm> {
    const data = this.getDbData();
    const now = new Date().toISOString();
    const newForm: PersonalisationForm = {
      ...form,
      createdAt: now,
      updatedAt: now,
    };
    data.forms.push(newForm);
    this.saveDbData(data);
    return newForm;
  }

  async update(id: string, updatedFields: Partial<PersonalisationForm>): Promise<PersonalisationForm> {
    const data = this.getDbData();
    const index = data.forms.findIndex((f: any) => f.id === id && !f.deletedAt);
    if (index === -1) {
      throw new Error(`PersonalisationForm with ID "${id}" not found`);
    }

    const currentForm = data.forms[index];
    
    // Save current version into history as version tracking to never break old orders
    const historyEntry: PersonalisationForm = JSON.parse(JSON.stringify(currentForm));
    data.history.push(historyEntry);

    // Increment version
    const nextVersion = (currentForm.version || 1) + 1;
    const now = new Date().toISOString();

    const mergedForm: PersonalisationForm = {
      ...currentForm,
      ...updatedFields,
      version: nextVersion,
      updatedAt: now,
    };

    // Make sure fields are assigned the new form ID and have correct IDs if not set
    if (updatedFields.fields) {
      mergedForm.fields = updatedFields.fields.map((field, idx) => ({
        ...field,
        id: field.id || `field-${id}-${Math.random().toString(36).substr(2, 9)}`,
        formId: id,
        sortOrder: field.sortOrder !== undefined ? field.sortOrder : idx + 1,
      }));
    }

    data.forms[index] = mergedForm;
    this.saveDbData(data);
    return mergedForm;
  }

  async delete(id: string): Promise<boolean> {
    const data = this.getDbData();
    const index = data.forms.findIndex((f: any) => f.id === id && !f.deletedAt);
    if (index === -1) return false;

    data.forms[index].deletedAt = new Date().toISOString();
    this.saveDbData(data);
    return true;
  }

  async duplicateForm(id: string, newSlug: string): Promise<PersonalisationForm> {
    const data = this.getDbData();
    const origin = data.forms.find((f: any) => f.id === id && !f.deletedAt);
    if (!origin) {
      throw new Error(`Original personalisation form not found`);
    }

    const newId = `form-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Clone fields
    const clonedFields = origin.fields.map((f, idx) => ({
      ...f,
      id: `field-${newId}-${Math.random().toString(36).substr(2, 9)}`,
      formId: newId,
      sortOrder: idx + 1,
    }));

    const clonedForm: PersonalisationForm = {
      id: newId,
      name: `${origin.name} (Copy)`,
      slug: newSlug,
      description: origin.description,
      status: origin.status,
      version: 1,
      createdAt: now,
      updatedAt: now,
      fields: clonedFields,
    };

    data.forms.push(clonedForm);
    this.saveDbData(data);
    return clonedForm;
  }

  async duplicateField(formId: string, fieldId: string): Promise<PersonalisationField> {
    const data = this.getDbData();
    const formIndex = data.forms.findIndex((f: any) => f.id === formId && !f.deletedAt);
    if (formIndex === -1) {
      throw new Error('Form not found');
    }

    const form = data.forms[formIndex];
    const fieldIndex = form.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) {
      throw new Error('Field not found in the form');
    }

    const originalField = form.fields[fieldIndex];
    const newFieldId = `field-${formId}-${Math.random().toString(36).substr(2, 9)}`;
    const newField: PersonalisationField = {
      ...JSON.parse(JSON.stringify(originalField)),
      id: newFieldId,
      label: `${originalField.label} (Copy)`,
      sortOrder: form.fields.length + 1,
    };

    form.fields.push(newField);
    form.updatedAt = new Date().toISOString();
    this.saveDbData(data);
    return newField;
  }

  async reorderFields(formId: string, fieldIds: string[]): Promise<PersonalisationField[]> {
    const data = this.getDbData();
    const formIndex = data.forms.findIndex((f: any) => f.id === formId && !f.deletedAt);
    if (formIndex === -1) {
      throw new Error('Form not found');
    }

    const form = data.forms[formIndex];
    // Reorder based on input fieldIds
    const orderedFields: PersonalisationField[] = [];
    
    fieldIds.forEach((id, idx) => {
      const match = form.fields.find((f) => f.id === id);
      if (match) {
        orderedFields.push({
          ...match,
          sortOrder: idx + 1,
        });
      }
    });

    // Add any remaining fields that were omitted from reorder list
    form.fields.forEach((f) => {
      if (!fieldIds.includes(f.id)) {
        orderedFields.push({
          ...f,
          sortOrder: orderedFields.length + 1,
        });
      }
    });

    form.fields = orderedFields;
    form.updatedAt = new Date().toISOString();
    this.saveDbData(data);
    return orderedFields;
  }

  // Assignments
  async assignFormToProduct(formId: string, productId: string): Promise<FormAssignment> {
    const data = this.getDbData();
    // Remove existing assignments for this product
    data.assignments = data.assignments.filter((a) => a.productId !== productId);

    const assignment: FormAssignment = {
      id: `assign-${Math.random().toString(36).substr(2, 9)}`,
      formId,
      productId,
      createdAt: new Date().toISOString(),
    };
    data.assignments.push(assignment);
    this.saveDbData(data);
    return assignment;
  }

  async assignFormToVariation(formId: string, variationId: string): Promise<FormAssignment> {
    const data = this.getDbData();
    // Remove existing assignments for this variation
    data.assignments = data.assignments.filter((a) => a.variationId !== variationId);

    const assignment: FormAssignment = {
      id: `assign-${Math.random().toString(36).substr(2, 9)}`,
      formId,
      variationId,
      createdAt: new Date().toISOString(),
    };
    data.assignments.push(assignment);
    this.saveDbData(data);
    return assignment;
  }

  async removeAssignment(productId?: string, variationId?: string): Promise<boolean> {
    const data = this.getDbData();
    const lenBefore = data.assignments.length;
    if (productId) {
      data.assignments = data.assignments.filter((a) => a.productId !== productId);
    } else if (variationId) {
      data.assignments = data.assignments.filter((a) => a.variationId !== variationId);
    }
    this.saveDbData(data);
    return data.assignments.length < lenBefore;
  }

  async getAssignmentForProduct(productId: string): Promise<PersonalisationForm | null> {
    const data = this.getDbData();
    const assign = data.assignments.find((a) => a.productId === productId);
    if (!assign) return null;
    return this.findById(assign.formId);
  }

  async getAssignmentForVariation(variationId: string): Promise<PersonalisationForm | null> {
    const data = this.getDbData();
    const assign = data.assignments.find((a) => a.variationId === variationId);
    if (!assign) return null;
    return this.findById(assign.formId);
  }

  // Global settings
  async getGlobalSettings() {
    const data = this.getDbData();
    return data.globalSettings || defaultGlobalSettings;
  }

  async updateGlobalSettings(settings: { requireWhatsAppForAllPersonalisedProducts: boolean }) {
    const data = this.getDbData();
    data.globalSettings = {
      ...data.globalSettings,
      ...settings,
    };
    this.saveDbData(data);
    return data.globalSettings;
  }
}
