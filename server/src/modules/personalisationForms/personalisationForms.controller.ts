import { Request, Response, NextFunction } from 'express';
import { PersonalisationFormService } from './personalisationForms.service';

const service = new PersonalisationFormService();

export const listForms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await service.listForms();
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const getForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const version = req.query.version ? parseInt(req.query.version as string, 10) : undefined;
    const form = await service.getFormById(id, version);
    res.json({ success: true, data: form });
  } catch (error) {
    next(error);
  }
};

export const getFormBySlugOrIdPublic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrSlug } = req.params;
    const version = req.query.version ? parseInt(req.query.version as string, 10) : undefined;
    
    let form;
    try {
      form = await service.getFormById(idOrSlug, version);
    } catch (e) {
      // If not found, try slug
      form = await service.getFormBySlug(idOrSlug);
    }
    
    res.json({ success: true, data: form });
  } catch (error) {
    next(error);
  }
};

export const createForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newForm = await service.createForm(req.body);
    res.status(201).json({ success: true, data: newForm });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, error: 'Input validation failed', details: error.errors });
    } else {
      next(error);
    }
  }
};

export const updateForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updated = await service.updateForm(id, req.body);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, error: 'Input validation failed', details: error.errors });
    } else {
      next(error);
    }
  }
};

export const deleteForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await service.deleteForm(id);
    res.json({ success: true, message: 'Personalisation Form deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const duplicateForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const duplicated = await service.duplicateForm(id);
    res.status(201).json({ success: true, data: duplicated });
  } catch (error) {
    next(error);
  }
};

export const duplicateField = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, fieldId } = req.params;
    const duplicatedField = await service.duplicateField(id, fieldId);
    res.status(201).json({ success: true, data: duplicatedField });
  } catch (error) {
    next(error);
  }
};

export const reorderFields = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { fieldIds } = req.body;
    if (!Array.isArray(fieldIds)) {
      res.status(400).json({ success: false, error: 'fieldIds must be an array of strings' });
      return;
    }
    const updatedFields = await service.reorderFields(id, fieldIds);
    res.json({ success: true, data: updatedFields });
  } catch (error) {
    next(error);
  }
};

// Assignments
export const assignForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { productId, variationId } = req.body;
    
    if (!productId && !variationId) {
      res.status(400).json({ success: false, error: 'productId or variationId is required' });
      return;
    }

    let assignment;
    if (productId) {
      assignment = await service.assignFormToProduct(id, productId);
    } else if (variationId) {
      assignment = await service.assignFormToVariation(id, variationId);
    }

    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

export const getAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, variationId } = req.query;
    let form = null;

    if (variationId) {
      form = await service.getAssignmentForVariation(variationId as string);
    } else if (productId) {
      form = await service.getAssignmentForProduct(productId as string);
    } else {
      res.status(400).json({ success: false, error: 'productId or variationId is required' });
      return;
    }

    res.json({ success: true, data: form });
  } catch (error) {
    next(error);
  }
};

export const removeAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, variationId } = req.query;
    if (!productId && !variationId) {
      res.status(400).json({ success: false, error: 'productId or variationId is required' });
      return;
    }

    await service.removeAssignment(productId as string, variationId as string);
    res.json({ success: true, message: 'Assignment removed successfully' });
  } catch (error) {
    next(error);
  }
};

// Global settings
export const getGlobalSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await service.getGlobalSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateGlobalSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requireWhatsAppForAllPersonalisedProducts } = req.body;
    if (typeof requireWhatsAppForAllPersonalisedProducts !== 'boolean') {
      res.status(400).json({ success: false, error: 'requireWhatsAppForAllPersonalisedProducts must be a boolean' });
      return;
    }
    const settings = await service.updateGlobalSettings({ requireWhatsAppForAllPersonalisedProducts });
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// Validate submission
export const validateSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const version = req.query.version ? parseInt(req.query.version as string, 10) : undefined;
    const { submissionData } = req.body;

    if (!submissionData) {
      res.status(400).json({ success: false, error: 'submissionData is required' });
      return;
    }

    const validationResult = await service.validateSubmission(id, submissionData, version);
    res.json({ success: true, data: validationResult });
  } catch (error) {
    next(error);
  }
};
