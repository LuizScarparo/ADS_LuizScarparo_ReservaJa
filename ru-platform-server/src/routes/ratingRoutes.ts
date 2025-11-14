import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import RatingController from "../controllers/ratingController";

const router = Router();

// Usuário
router.post("/", authMiddleware, RatingController.createOrUpdate);
router.get("/me", authMiddleware, RatingController.getMyRating);

// Admin
router.get(
  "/summary",
  authMiddleware,
  adminMiddleware,
  RatingController.getSummary
);

router.get(
  "/list",
  authMiddleware,
  adminMiddleware,
  RatingController.getListForMeal
);

router.get(
  "/summary/last7",
  authMiddleware,
  adminMiddleware,
  RatingController.getLast7Summary
);

export default router;
