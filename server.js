// server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';

import connectDB from './config/db.js';
import initSocket from './socket/index.js';

import userAuth from './routes/authRoute.js';
import rideRoutes from './routes/rideRoutes.js';
import chatRoute from './routes/chatRoute.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize database
connectDB();

// Initialize socket
export const io = initSocket(httpServer);

// Attach socket instance to each request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Routes
app.use('/api/v1/rides', rideRoutes);
app.use('/api/v1/auth', userAuth);
app.use('/api/v1/chat', chatRoute);

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the Carpool Application');
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
