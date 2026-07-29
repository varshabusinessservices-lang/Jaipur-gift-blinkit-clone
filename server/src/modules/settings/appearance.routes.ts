import { Router } from "express";
import { AppearanceController } from "./appearance.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

const router = Router();
const controller = new AppearanceController();

router.use(requireAuth);
router.use(requireRole(['SUPER_ADMIN', 'ADMIN']));

// Theme Dashboard
router.get("/theme", controller.getTheme);
router.put("/theme", controller.updateTheme);
router.post("/theme/preview", controller.previewTheme);
router.post("/theme/publish", controller.publishTheme);
router.get("/theme/versions", controller.getThemeVersions);
router.post("/theme/versions/:id/restore", controller.restoreThemeVersion);

// Global Styles
router.get("/global-styles", controller.getGlobalStyles);
router.put("/global-styles", controller.updateGlobalStyles);

// Homepage
router.get("/homepage", controller.getHomepage);
router.put("/homepage", controller.updateHomepage);
router.post("/homepage/sections", controller.addHomepageSection);
router.put("/homepage/sections/:id", controller.updateHomepageSection);
router.delete("/homepage/sections/:id", controller.deleteHomepageSection);
router.post("/homepage/reorder", controller.reorderHomepageSections);

export default router;
