import express from 'express';
import {
  createFeedback,
  getAllFeedback,
  getFeedbackSummary,
  getFeedbackById
} from '../controllers/feedbackController.js';

const router = express.Router();

// POST /api/feedback
router.post('/', createFeedback);

// GET /api/feedback
router.get('/', getAllFeedback);

// GET /api/feedback/summary
// MUST be defined before /:id to prevent collision
router.get('/summary', getFeedbackSummary);

// GET /api/feedback/:id
router.get('/:id', getFeedbackById);

export default router;
