import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/request-reset-password', AuthController.requestResetPassword);
router.post('/reset-password/:id/:token', AuthController.resetPassword);

export default router;
