import { Router } from 'express';
import {
  getAllFeedbacks,
  createFeedback,
  getFeedbackSummary,
  getFeedback
} from '../controllers/feedbackController.js';

const router = Router();

// Routes
router.get('/', getAllFeedbacks);
router.post('/', createFeedback);
router.get('/summary', getFeedbackSummary);
router.get('/:id', getFeedback);

export default router;
