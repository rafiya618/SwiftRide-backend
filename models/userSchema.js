import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  avatar: { type: String }, // URL to user's profile picture
  role: { type: String, enum: ['driver', 'passenger'], default: 'passenger' },
  vehicle: {
    make: { type: String },
    model: { type: String },
    year: { type: Number },
    licensePlate: { type: String },
    Type: { type: String },  // AC or DC or Bike
  },
  ratings: [{ type: Schema.Types.ObjectId, ref: 'Rating' }],
  rides: [{ type: Schema.Types.ObjectId, ref: 'Ride' }],
  joinedRides: [{ type: Schema.Types.ObjectId, ref: 'Ride' }],
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});


const User = model('User', userSchema);
export default User;
