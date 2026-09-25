import { Router } from 'express';
import {
  getAllFeedbacks,
  getFeedback,
  getFeedbackSummary,
  createFeedback,
  updateFeedback,
  deleteFeedback
} from '../controllers/feedbackController.js';

const router = Router();

// TODO: wire up the six routes described in README.md section 3.

export default router;
