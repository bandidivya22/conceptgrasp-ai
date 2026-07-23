import express from 'express';
import {
  generateStudyPlanController,
  getStudyPlans,
  getStudyPlan,
} from '../controllers/studyPlanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateStudyPlanController);
router.get('/', protect, getStudyPlans);
router.get('/:id', protect, getStudyPlan);

export default router;
