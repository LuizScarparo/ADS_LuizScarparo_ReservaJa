// backend/src/routes/userRoutes.ts
import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

router.get('/', authMiddleware, adminMiddleware, UserController.getUsers);
router.get('/:id', authMiddleware, UserController.getUserById)
router.delete("/:id", authMiddleware, UserController.deleteUser);
router.patch("/:id", authMiddleware, UserController.updateUser);

export default router;
