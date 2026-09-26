import { Router } from 'express';
import {
  getAllFeedbacks,
  getFeedback,
  createFeedback,
  getFeedbackSummary,
} from '../controllers/feedbackController.js';

const router = Router();

// GET /api/feedback
router.get('/', getAllFeedbacks);

// GET /api/feedback/summary (Must be before /:id)
router.get('/summary', getFeedbackSummary);

// GET /api/feedback/:id
router.get('/:id', getFeedback);

// POST /api/feedback
router.post('/', createFeedback);

export default router;
