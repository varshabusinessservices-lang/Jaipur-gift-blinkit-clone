import { Router, Request, Response } from "express";
import { AppearanceService } from "./appearance.service";

const router = Router();
const appearanceService = new AppearanceService();

router.get("/theme", async (req: Request, res: Response) => {
  try {
    const theme = await appearanceService.getDraftTheme();
    res.status(200).json({ success: true, data: theme });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/homepage", async (req: Request, res: Response) => {
  try {
    const homepage = await appearanceService.getHomepage();
    res.status(200).json({ success: true, data: homepage });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
