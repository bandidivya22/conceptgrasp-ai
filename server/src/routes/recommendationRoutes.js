import express from 'express';
import { getRecommendations, getRecommendationHistory } from '../controllers/recommendationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getRecommendations);
router.get('/history', protect, getRecommendationHistory);

export default router;
