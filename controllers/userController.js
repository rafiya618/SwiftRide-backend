import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';

export const register = async (req, res) => {
  const { fullName, email, password, phone, role, vehicle, location } = req.body;
  console.log(req.body);

  try {
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (role === 'driver' && (!vehicle || !vehicle.make || !vehicle.model || !vehicle.licensePlate)) {
      return res.status(400).json({ message: 'Vehicle information is required for drivers' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Use the location from request or default to [0, 0]
    const userLocation = location || {
      type: 'Point',
      coordinates: [0, 0],
    };

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role,
      vehicle: role === 'driver' ? vehicle : undefined,
      location: role === 'driver' ? userLocation : undefined,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, "carpool", { expiresIn: '1d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser._id, fullName, email, role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with role included in the payload
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Payload includes both ID and role
      'carpool', // Secret key
      { expiresIn: '1h' } // Token expiration time
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// New function to fetch drivers details
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' });
    res.status(200).json(drivers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const driverId = req.params.id;  // Extracting the driver ID from the route parameters
    const driver = await User.findById(driverId);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.status(200).json(driver);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching driver', error });
  }
};

export const updateLocation = async (req, res) => {
  const { id, lng, lat } = req.body;

  try {
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      return res.status(400).json({ message: 'Longitude and latitude must be numbers' });
    }

    const user = await User.findByIdAndUpdate(id, {
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    }, { new: true });

    res.status(200).json({ message: 'Location updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update location', error });
  }
};

export const driversNearby = async (req, res) => {
  const { lng, lat } = req.query;
  try {
    const drivers = await User.find({
      role: 'driver',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: 10000, // 10km radius
        },
      },
    });
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch nearby drivers', error });
  }
};