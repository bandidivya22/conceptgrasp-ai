import express from 'express';
import {
  generateQuizController,
  submitQuiz,
  getQuizHistory,
  getQuizzes,
  getQuizById,
} from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateQuizController);
router.post('/submit', protect, submitQuiz);
router.get('/history', protect, getQuizHistory);
router.get('/:id', protect, getQuizById);
router.get('/', protect, getQuizzes);

export default router;
