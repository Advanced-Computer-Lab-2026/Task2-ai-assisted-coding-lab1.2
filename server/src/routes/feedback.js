import { Router } from 'express';
import {
  getAllFeedbacks,
  getFeedback,
  createFeedback,
  getFeedbackSummary
} from '../controllers/feedbackController.js';

const router = Router();

// 1. GET /api/feedback/summary (Must be before /:id)
router.get('/summary', getFeedbackSummary);

// 2. GET and POST for /api/feedback
router.route('/')
  .get(getAllFeedbacks)
  .post(createFeedback);

// 3. GET /api/feedback/:id
router.get('/:id', getFeedback);

export default router;