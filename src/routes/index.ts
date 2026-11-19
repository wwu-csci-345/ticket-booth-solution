import { Router } from 'express';
import { EventController } from '../controllers/eventController';
import { AuthController } from '../controllers/authController';
import { BookingController } from '../controllers/bookingController';

/** Maps each URL to one controller method. */
export const router = Router();

router.get('/events', EventController.search);
router.get('/events/:id', EventController.show);
router.post('/login', AuthController.login);
router.post('/bookings', BookingController.create);
router.get('/bookings/:id', BookingController.show);
