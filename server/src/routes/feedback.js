import { Router } from 'express';

import {
  getAllFeedbacks,
  getFeedback,
  createFeedback,
  getFeedbackSummary,
} from '../controllers/feedbackController.js';

const router = Router();

router.get('/', getAllFeedbacks);

router.get('/summary', getFeedbackSummary);

router.get('/:id', getFeedback);

router.post('/', createFeedback);

export default router;