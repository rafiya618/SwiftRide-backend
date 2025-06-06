import express from 'express';
import { saveChatMessage, getChatMessages, initializeChatRoom } from '../controllers/chatController.js';
import { getChatRooms } from '../controllers/chatController.js';


const router = express.Router();
router.get('/rooms/:userId', getChatRooms);
router.post('/message', saveChatMessage);
router.get('/messages/:roomId', getChatMessages);
router.post('/join', initializeChatRoom);

export default router;
