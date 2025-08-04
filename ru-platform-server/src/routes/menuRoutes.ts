import { Router } from "express";
import { MenuController } from "../controllers/menuController";
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

router.post("/upload", authMiddleware, adminMiddleware, MenuController.postMenu);
router.get("/menus", authMiddleware, MenuController.getMenus);

export default router;