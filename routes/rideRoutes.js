// routes/rideRoutes.js
import express from 'express';
import { createRide, searchRides, joinRide, cancelRide,getUserRideHistory,searchFilteredDrivers ,endRide} from '../controllers/rideController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', createRide); 
router.get('/search', searchRides); // Passengers search for rides
router.post('/join', joinRide); 
router.post('/cancel', cancelRide); // Drivers cancel a ride
router.get('/ride-history', authMiddleware, getUserRideHistory);
router.put('/end/:rideId', authMiddleware, endRide);
router.get('/filtered-drivers', searchFilteredDrivers);
export default router;
