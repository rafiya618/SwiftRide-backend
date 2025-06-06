import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Chat', chatSchema);
