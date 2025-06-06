// controllers/rideController.js
import mongoose from 'mongoose';
import Ride from '../models/rideSchema.js';
import Chat from '../models/chatSchema.js'; // Import Chat model

export const createRide = async (req, res) => {
  const { driver, passenger, origin, destination, departureTime, price } = req.body;

  try {
    if (!driver || !passenger || !origin || !destination || !departureTime || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const ride = new Ride({
      driver,
      passenger,
      origin,
      destination,
      departureTime,
      price,
    });

    await ride.save();
    // Create chat room using ride ID
    const roomId = ride._id.toString();
    req.io.to(driver).emit("joinRoom", { roomId, message: `You have joined room: ${roomId}` });
    req.io.to(passenger).emit("joinRoom", { roomId, message: `You have joined room: ${roomId}` });

    // Save initial messages to the database
    await saveChatMessage(roomId, driver, `You have been booked for a ride with ride ID: ${ride._id}`);
    await saveChatMessage(roomId, passenger, `You have successfully booked a ride with driver ID: ${driver}`);

    res.status(201).json({ message: 'Ride created successfully', ride });
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to save chat messages
export const saveChatMessage = async (roomId, senderId, message) => {
  const chatMessage = new Chat({ roomId, senderId, message });
  await chatMessage.save();
};

export const searchRides = async (req, res) => {
  try {
    const { origin, destination, departureTime } = req.query;
    const query = { status: 'upcoming' };
    if (origin) query['origin.address'] = origin;
    if (destination) query['destination.address'] = destination;
    if (departureTime) query.departureTime = { $gte: new Date(departureTime) };

    const rides = await Ride.find(query).populate('driver passengers');
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search rides' });
  }
};

export const joinRide = async (req, res) => {
  try {
    const { rideId } = req.body;

    if (!rideId) {
      return res.status(400).json({ error: 'Ride ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({ error: 'Invalid Ride ID' });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Set ride status to "ongoing"
    ride.status = "ongoing";
    await ride.save();

    res.status(200).json({ message: 'Successfully joined ride', ride });
  } catch (error) {
    console.error('Error joining ride:', error);
    res.status(500).json({ error: 'Failed to join ride' });
  }
};

export const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.body;
    const ride = await Ride.findById(rideId);

    if (ride.driver.equals(req.user.id)) {
      ride.status = 'cancelled';
      await ride.save();
      res.status(200).json({ message: 'Ride cancelled' });
    } else {
      res.status(403).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel ride' });
  }
};

export const getUserRideHistory = async (req, res) => {
  try {
    const userId = req.user.id;  // Extract user ID from JWT token
    const userRole = req.user.role;
    console.log(userId, " ", userRole);

    let rides;

    if (userRole === 'passenger') {
      // Find all rides where the user is a passenger
      rides = await Ride.find({ passenger: userId });
    } else if (userRole === 'driver') {
      // Find all rides where the user is the driver
      rides = await Ride.find({ driver: userId })
        .populate('driver', 'fullName vehicle');
    } else {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    // Check if any rides are found
    if (!rides || rides.length === 0) {
      console.log('No rides found');
      return res.status(404).json({ error: 'No rides found for this user' });
    }

    // Respond with the rides data
    res.status(200).json(rides);
    console.log(rides);

  } catch (error) {
    console.error('Error fetching ride history:', error);
    res.status(500).json({ error: 'Failed to fetch ride history' });
  }
};

export const searchFilteredDrivers = async (req, res) => {
  try {
    // Remove gender filter logic
    return res.status(400).json({ error: 'Gender filter is no longer supported' });
  } catch (error) {
    console.error('Error fetching filtered drivers:', error);
    res.status(500).json({ error: 'Failed to fetch filtered drivers' });
  }
};

export const endRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;

    // Check if the ride exists
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (!ride.driver.equals(userId)) {
      return res.status(403).json({ error: 'You are not authorized to end this ride' });
    }

    // Update the ride status to 'completed'
    ride.status = 'completed';
    await ride.save();

    res.status(200).json({ message: 'Ride has been successfully completed', ride });
  } catch (error) {
    console.error('Error ending ride:', error);
    res.status(500).json({ error: 'Failed to complete ride' });
  }
};
