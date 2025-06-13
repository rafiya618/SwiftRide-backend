import Ride from '../models/rideSchema.js';
import Chat from '../models/chatSchema.js';

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

export const getUserRideHistory = async (req, res) => {
    try {
        if (!req.user) {
            console.error('req.user is undefined');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = req.user.id;
        const userRole = req.user.role;

        console.log('Fetching ride history for user:', userId, '| Role:', userRole);

        let rides;

        if (userRole === 'passenger') {
            rides = await Ride.find({ passenger: userId });
        } else if (userRole === 'driver') {
            rides = await Ride.find({ driver: userId })
                .populate('driver', 'fullName vehicle'); // Populate only relevant fields
        } else {
            return res.status(400).json({ error: 'Invalid user role' });
        }

        if (!rides || rides.length === 0) {
            console.log('No rides found for this user');
            return res.status(404).json({ error: 'No rides found' });
        }

        res.status(200).json(rides);
    } catch (error) {
        console.error('Error fetching ride history:', error);
        res.status(500).json({ error: 'Failed to fetch ride history' });
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

export const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;

    // Find the ride
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Only the driver can cancel the ride
    if (!ride.driver.equals(userId)) {
      return res.status(403).json({ error: 'You are not authorized to cancel this ride' });
    }

    // Update the ride status to 'cancelled'
    ride.status = 'cancelled';
    await ride.save();

    res.status(200).json({ message: 'Ride has been cancelled', ride });
  } catch (error) {
    console.error('Error cancelling ride:', error);
    res.status(500).json({ error: 'Failed to cancel ride' });
  }
};
