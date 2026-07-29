import { Request, Response } from "express";
import { AppearanceService } from "./appearance.service";

const appearanceService = new AppearanceService();

export class AppearanceController {
  public async getTheme(req: Request, res: Response): Promise<void> {
    try {
      const theme = await appearanceService.getDraftTheme();
      res.status(200).json({ success: true, data: theme });
    } catch (error: any) {
      console.error("Error in getTheme:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async updateTheme(req: Request, res: Response): Promise<void> {
    try {
      const theme = await appearanceService.updateTheme(req.body, (req as any).user?.id);
      res.status(200).json({ success: true, data: theme });
    } catch (error: any) {
      console.error("Error in updateTheme:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async previewTheme(req: Request, res: Response): Promise<void> {
    try {
      const preview = await appearanceService.previewTheme();
      res.status(200).json({ success: true, data: preview });
    } catch (error: any) {
      console.error("Error in previewTheme:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async publishTheme(req: Request, res: Response): Promise<void> {
    try {
      const result = await appearanceService.publishTheme((req as any).user?.id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      console.error("Error in publishTheme:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getThemeVersions(req: Request, res: Response): Promise<void> {
    try {
      const versions = await appearanceService.getThemeVersions();
      res.status(200).json({ success: true, data: versions });
    } catch (error: any) {
      console.error("Error in getThemeVersions:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async restoreThemeVersion(req: Request, res: Response): Promise<void> {
    try {
      const result = await appearanceService.restoreThemeVersion(req.params.id, (req as any).user?.id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      console.error("Error in restoreThemeVersion:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getGlobalStyles(req: Request, res: Response): Promise<void> {
    try {
      const styles = await appearanceService.getGlobalStyles();
      res.status(200).json({ success: true, data: styles });
    } catch (error: any) {
      console.error("Error in getGlobalStyles:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async updateGlobalStyles(req: Request, res: Response): Promise<void> {
    try {
      const styles = await appearanceService.updateGlobalStyles(req.body, (req as any).user?.id);
      res.status(200).json({ success: true, data: styles });
    } catch (error: any) {
      console.error("Error in updateGlobalStyles:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getHomepage(req: Request, res: Response): Promise<void> {
    try {
      const homepage = await appearanceService.getHomepage();
      res.status(200).json({ success: true, data: homepage });
    } catch (error: any) {
      console.error("Error in getHomepage:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async updateHomepage(req: Request, res: Response): Promise<void> {
    try {
      const homepage = await appearanceService.updateHomepage(req.body, (req as any).user?.id);
      res.status(200).json({ success: true, data: homepage });
    } catch (error: any) {
      console.error("Error in updateHomepage:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async addHomepageSection(req: Request, res: Response): Promise<void> {
    try {
      const section = await appearanceService.addHomepageSection(req.body);
      res.status(201).json({ success: true, data: section });
    } catch (error: any) {
      console.error("Error in addHomepageSection:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async updateHomepageSection(req: Request, res: Response): Promise<void> {
    try {
      const section = await appearanceService.updateHomepageSection(req.params.id, req.body);
      res.status(200).json({ success: true, data: section });
    } catch (error: any) {
      console.error("Error in updateHomepageSection:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async deleteHomepageSection(req: Request, res: Response): Promise<void> {
    try {
      await appearanceService.deleteHomepageSection(req.params.id);
      res.status(200).json({ success: true, message: "Section deleted" });
    } catch (error: any) {
      console.error("Error in deleteHomepageSection:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async reorderHomepageSections(req: Request, res: Response): Promise<void> {
    try {
      const result = await appearanceService.reorderHomepageSections(req.body.sectionIds);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      console.error("Error in reorderHomepageSections:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
