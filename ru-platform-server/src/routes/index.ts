import { Router } from 'express';
import userRoutes from './userRoutes';
import reservationRoutes from './reservationRoutes';
import menuRoutes from './menuRoutes';
import authRoutes from './authRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/reservations', reservationRoutes);
router.use('/menu', menuRoutes);

export default router;
