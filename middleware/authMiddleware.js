// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET || 'swiftride'; // Must match the secret used during token creation

const authMiddleware = (req, res, next) => {
    console.log('Auth middleware hit');
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No token provided in Authorization header');
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token received:', token);

    try {
        const decoded = jwt.verify(token, secretKey);
        console.log('Decoded Token:', decoded);
        req.user = decoded; // Attach user info to request
        next(); // Proceed to the controller
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default authMiddleware;
