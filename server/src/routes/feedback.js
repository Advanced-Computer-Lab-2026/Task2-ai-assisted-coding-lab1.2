import { Router } from 'express';
import {
  getAllFeedbacks,
  getFeedback,
  createFeedback,
  getFeedbackSummary
} from '../controllers/feedbackController.js';

const router = Router();

// TODO: wire up the three routes in README.md section 2 and the summary route in section 3.

export default router;
