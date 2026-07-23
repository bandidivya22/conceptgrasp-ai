import express from 'express';
import {
  chat,
  getChatHistory,
  getConversation,
  deleteConversation,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, chat);
router.get('/history', protect, getChatHistory);
router.get('/:id', protect, getConversation);
router.delete('/:id', protect, deleteConversation);

export default router;
