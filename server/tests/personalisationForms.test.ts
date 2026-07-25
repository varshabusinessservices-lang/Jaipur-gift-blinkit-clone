import { describe, it, expect, beforeEach } from 'vitest';
import { PersonalisationFormService } from '../src/modules/personalisationForms/personalisationForms.service';
import { PersonalisationFormRepository } from '../src/modules/personalisationForms/personalisationForms.repository';
import { validatePersonalisationSubmission } from '../src/modules/personalisationForms/validationEngine';

describe('Personalisation Forms Module', () => {
  let service: PersonalisationFormService;
  let repo: PersonalisationFormRepository;

  beforeEach(() => {
    repo = new PersonalisationFormRepository();
    service = new PersonalisationFormService(repo);
  });

  describe('1. Validation Engine Rules', () => {
    it('should validate text fields (length, uppercase, and trim)', () => {
      const form: any = {
        fields: [
          {
            id: 'f1',
            label: 'Name',
            fieldType: 'TEXT',
            required: true,
            validationJson: {
              text: { minLength: 3, maxLength: 10, uppercase: true, trim: true },
            },
          },
        ],
      };

      // Invalid case: too short
      let res = validatePersonalisationSubmission(form, { f1: 'ab' });
      expect(res.isValid).toBe(false);
      expect(res.errors[0].message).toContain('at least 3 characters');

      // Invalid case: not uppercase
      res = validatePersonalisationSubmission(form, { f1: 'John' });
      expect(res.isValid).toBe(false);
      expect(res.errors[0].message).toContain('uppercase');

      // Valid case
      res = validatePersonalisationSubmission(form, { f1: '  JOHN  ' });
      expect(res.isValid).toBe(true);
    });

    it('should validate number fields', () => {
      const form: any = {
        fields: [
          {
            id: 'f2',
            label: 'Age',
            fieldType: 'NUMBER',
            required: true,
            validationJson: {
              number: { min: 18, max: 100, integer: true },
            },
          },
        ],
      };

      // Invalid case: too low
      let res = validatePersonalisationSubmission(form, { f2: 15 });
      expect(res.isValid).toBe(false);

      // Invalid case: float instead of integer
      res = validatePersonalisationSubmission(form, { f2: 25.5 });
      expect(res.isValid).toBe(false);

      // Valid case
      res = validatePersonalisationSubmission(form, { f2: 30 });
      expect(res.isValid).toBe(true);
    });

    it('should enforce global WhatsApp required rule when enabled', () => {
      const form: any = {
        fields: [
          {
            id: 'wa1',
            label: 'WhatsApp Number',
            fieldType: 'WHATSAPP',
            required: false, // Optional in form
            validationJson: {
              whatsapp: { isWhatsApp: true },
              phone: { length: 10 }
            },
          },
        ],
      };

      // When global WhatsApp require is active, force required
      let res = validatePersonalisationSubmission(form, {}, { requireWhatsAppForAllPersonalisedProducts: true });
      expect(res.isValid).toBe(false);
      expect(res.errors[0].message).toContain('required');

      // Valid WhatsApp number
      res = validatePersonalisationSubmission(form, { wa1: '9876543210' }, { requireWhatsAppForAllPersonalisedProducts: true });
      expect(res.isValid).toBe(true);
    });

    it('should validate minimum/maximum image counts', () => {
      const form: any = {
        fields: [
          {
            id: 'photos',
            label: 'Supporting Photos',
            fieldType: 'SUPPORTING_PHOTOS',
            required: true,
            settingsJson: {
              imageSettings: { minImages: 5, maxImages: 10 }
            }
          }
        ]
      };

      // Under minimum
      let res = validatePersonalisationSubmission(form, { photos: [{ name: 'img1.png' }] });
      expect(res.isValid).toBe(false);
      expect(res.errors[0].message).toContain('at least 5 photo');

      // Correct count
      const correctList = Array(6).fill({ name: 'pic.jpg', size: 1000 });
      res = validatePersonalisationSubmission(form, { photos: correctList });
      expect(res.isValid).toBe(true);
    });
  });

  describe('2. Assignments & Product Overrides', () => {
    it('should assign a form to a product and retrieve it', async () => {
      const allForms = await service.listForms();
      const testForm = allForms[0];
      const prodId = 'test-product-123';

      await service.assignFormToProduct(testForm.id, prodId);
      const assigned = await service.getAssignmentForProduct(prodId);
      expect(assigned).not.toBeNull();
      expect(assigned?.id).toBe(testForm.id);
    });

    it('should allow variation to override a product assignment', async () => {
      const allForms = await service.listForms();
      const formA = allForms[0];
      const formB = allForms[1];
      const variationId = 'test-var-456';

      await service.assignFormToVariation(formB.id, variationId);
      const assignedVar = await service.getAssignmentForVariation(variationId);
      expect(assignedVar?.id).toBe(formB.id);
    });
  });

  describe('3. Versioning Control', () => {
    it('should increment version on update and retain old version in history', async () => {
      const forms = await service.listForms();
      const originalForm = forms[0];
      const originalVersion = originalForm.version || 1;

      const updated = await service.updateForm(originalForm.id, {
        name: originalForm.name,
        description: 'New descriptive update',
        status: originalForm.status,
        fields: originalForm.fields,
      });

      // Verify version increased
      expect(updated.version).toBe(originalVersion + 1);

      // Verify lookup of older version succeeds
      const oldVersionLookedUp = await service.getFormById(originalForm.id, originalVersion);
      expect(oldVersionLookedUp).not.toBeNull();
      expect(oldVersionLookedUp?.version).toBe(originalVersion);
    });
  });
});
