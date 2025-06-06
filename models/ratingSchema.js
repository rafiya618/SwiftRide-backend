//The Rating model collects feedback from users about their ride experience.

import mongoose  from 'mongoose';
const { Schema } = mongoose;


const ratingSchema = new Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    ride: { type: mongoose.Types.ObjectId, ref: 'Ride', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String },
    createdAt: { type: Date, default: Date.now },
  });
  
  const Rating = mongoose.model('Rating', ratingSchema);
  module.exports = Rating;
  