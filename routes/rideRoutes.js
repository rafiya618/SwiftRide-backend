import express from 'express';
import { createRide, getUserRideHistory, endRide, cancelRide } from '../controllers/rideController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/create', authMiddleware, createRide); 
router.get('/ride-history', authMiddleware, getUserRideHistory);
router.put('/end/:rideId', authMiddleware, endRide);
router.put('/cancel/:rideId', authMiddleware, cancelRide); 
export default router;
