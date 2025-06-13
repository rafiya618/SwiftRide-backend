// routes/rideRoutes.js
import express from 'express';
import { createRide,getUserRideHistory,endRide} from '../controllers/rideController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/create', createRide); 
router.get('/ride-history', authMiddleware, getUserRideHistory);
router.put('/end/:rideId', authMiddleware, endRide);
export default router;
