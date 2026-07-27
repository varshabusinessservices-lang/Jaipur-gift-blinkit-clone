import { Request, Response } from 'express';
import { SettingsService } from './settings.service';

export class SettingsController {
  private service = new SettingsService();

  getSettings = async (req: Request, res: Response) => {
    try {
      const { namespace } = req.params;
      if (!namespace) {
        return res.status(400).json({ success: false, error: 'Namespace is required' });
      }
      
      const data = await this.service.getSettingsByNamespace(namespace);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  saveSettings = async (req: Request, res: Response) => {
    try {
      const { namespace } = req.params;
      if (!namespace) {
        return res.status(400).json({ success: false, error: 'Namespace is required' });
      }

      const adminId = (req as any).user?.id;
      await this.service.saveSettings(namespace, req.body, adminId);
      res.json({ success: true, message: 'Settings saved successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
