import express from 'express';
import { register, login, getAllDrivers} from '../controllers/userController.js';

const router = express.Router();

// Registration route
router.post('/register', register);

// Login route
router.post('/login', login);

//other user routes
router.get('/drivers', getAllDrivers);

export default router;
