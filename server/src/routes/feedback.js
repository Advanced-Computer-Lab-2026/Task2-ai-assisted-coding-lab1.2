import express from 'express';
import {
  createFeedback,
  getAllFeedbacks,
  getFeedbackSummary,
  getFeedback,
} from '../controllers/feedbackController.js';

const router = express.Router();

// GET /summary MUST precede /:id so "summary" is not captured as an id parameter
router.get('/summary', getFeedbackSummary);

router.post('/', createFeedback);
router.get('/', getAllFeedbacks);
router.get('/:id', getFeedback);

export default router;