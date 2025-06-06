import Chat from '../models/chatSchema.js';
import { io } from '../server.js';
import mongoose from 'mongoose'; 

// Save and emit chat message
export const saveChatMessage = async (req, res) => {
  const { roomId, senderId, receiverId, message } = req.body;

  if (!roomId || !message || !senderId || !receiverId) {
    return res.status(400).json({ error: 'roomId, senderId, receiverId, and message are required' });
  }

  if (
    !mongoose.Types.ObjectId.isValid(roomId) ||
    !mongoose.Types.ObjectId.isValid(senderId) ||
    !mongoose.Types.ObjectId.isValid(receiverId)
  ) {
    return res.status(400).json({ error: 'Invalid ObjectId' });
  }

  try {
    const chatMessage = new Chat({ roomId, senderId, receiverId, message });
    await chatMessage.save();

    io.to(roomId).emit("newMessage", { roomId, senderId, message });
    res.status(201).json({ message: 'Message sent', chatMessage });
  } catch (error) {
    console.error('Error saving chat message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Retrieve chat messages for a specific room
export const getChatMessages = async (req, res) => {
  const { roomId } = req.params;
  
  if (!roomId) return res.status(400).json({ error: 'Room ID is required' });

  try {
    const messages = await Chat.find({ roomId });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ error: 'Failed to retrieve chat messages' });
  }
};

// Initialize chat room with a default message
export const initializeChatRoom = async (rideId, driverId, passengerId) => {
  try {
    const welcomeMessage = `Welcome to the chat for ride ${rideId}`;
    const chatMessage = new Chat({
      roomId: rideId,
      senderId: driverId,
      receiverId: passengerId,
      message: welcomeMessage,
    });

    await chatMessage.save();
    io.to(rideId).emit("newMessage", { roomId: rideId, senderId: "System", message: welcomeMessage });
  } catch (error) {
    console.error('Error initializing chat room:', error);
  }
};

export const getChatRooms = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const chatRooms = await Chat.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$roomId",
          latestMessage: { $first: "$message" },
          latestSenderId: { $first: "$senderId" },
          latestReceiverId: { $first: "$receiverId" }, 
          latestCreatedAt: { $first: "$createdAt" },
        },
      },
      { $sort: { latestCreatedAt: -1 } },
    ]);

    res.status(200).json(chatRooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
