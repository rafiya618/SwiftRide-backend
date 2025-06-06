import express from 'express';
import { register, login, getAllDrivers,getDriverById,driversNearby,updateLocation } from '../controllers/userController.js';

const router = express.Router();

// Registration route
router.post('/register', register);

// Login route
router.post('/login', login);

//other user routes
router.get('/drivers', getAllDrivers);
router.get('/drivers/:id', getDriverById);
router.post('/update-location',updateLocation);
router.get('/drivers-nearby',driversNearby);


export default router;
