// socket/index.js
import { Server } from 'socket.io';
import { saveChatMessage } from '../controllers/chatController.js';

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected ${socket.id}`);
    socket.emit("welcome", `Welcome to server ${socket.id}`);
    socket.broadcast.emit("welcome", `${socket.id} joined the server`);

    socket.on("driverLocation", (locationData) => {
      const { driverId, lat, lng } = locationData;
      console.log(`Driver ${driverId} is at ${lat}, ${lng}`);
      io.emit("locationUpdate", locationData);

      const userId = socket.handshake.query.userId;
      if (userId) {
        socket.join(userId);
      }
    });

    socket.on("joinRoom", ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`${userId} joined room: ${roomId}`);
    });

    socket.on("chatMessage", async ({ rideId, senderId, message }) => {
      try {
        const chatMessage = { rideId, senderId, message };
        await saveChatMessage({ body: chatMessage });
      } catch (error) {
        console.error('Failed to save or emit chat message:', error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
      io.emit("driverDisconnected", { driverId: socket.id });
    });
  });

  return io;
};

export default initSocket;
