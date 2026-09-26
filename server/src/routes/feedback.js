import express from 'express';
import {
  createFeedback,
  getAllFeedbacks,
  getFeedback,
  getFeedbackSummary,
} from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/', createFeedback);
router.get('/summary', getFeedbackSummary); // must come before '/:id'
router.get('/:id', getFeedback);
router.get('/', getAllFeedbacks);

export default router;