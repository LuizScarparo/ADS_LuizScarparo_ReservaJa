import { Router } from 'express';
import { ReservationController } from '../controllers/reservationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

router.post('/', authMiddleware, ReservationController.createReservation);

router.get('/', authMiddleware, adminMiddleware, ReservationController.getReservations);
router.get('/me', authMiddleware, ReservationController.getUserReservations);
router.get('/day', authMiddleware, adminMiddleware, ReservationController.getTodayReservations);
router.get('/week', authMiddleware, adminMiddleware, ReservationController.getWeekReservations);

router.patch('/:id', authMiddleware, ReservationController.updateReservation);
router.patch('/status/:id', authMiddleware, adminMiddleware, ReservationController.updateReservationStatus);

router.delete('/:id', authMiddleware, ReservationController.deleteReservation);


export default router;
