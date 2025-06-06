// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET // Ensure this matches the key used to sign the tokens

const authMiddleware = (req, res, next) => {
    console.log('Auth middleware hit'); // Debug log
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Token:', token); // Log the token

    if (!token) {
        console.log('No token provided'); // Debug log
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, secretKey); // Verify the token
        console.log('Decoded Token:', decoded); // Log the decoded token
        req.user = decoded; // Attach the decoded token payload to the request
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Token Verification Error:', error); // Log error details
        res.status(401).json({ message: 'Invalid token' }); // Respond with an error if verification fails
    }
};

export default authMiddleware;
