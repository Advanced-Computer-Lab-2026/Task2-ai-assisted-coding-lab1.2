import { Router } from 'express';
import {
  getAllFeedbacks,
  getFeedback,
  createFeedback,
  getFeedbackSummary
} from '../controllers/feedbackController.js';

const router = Router();

// POST /api/feedback
router.post('/', createFeedback);

// GET /api/feedback
router.get('/', getAllFeedbacks);

router.get('/summary', getFeedbackSummary);

// GET /api/feedback/:id
router.get('/:id', getFeedback);

export default router;