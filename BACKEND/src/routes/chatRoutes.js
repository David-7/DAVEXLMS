import express from 'express';
import { getMessages, sendMessage, deleteMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/messages', getMessages);
router.post('/messages', sendMessage);
router.delete('/messages/:messageId', deleteMessage);

export default router;
