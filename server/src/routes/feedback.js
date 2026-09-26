import { Router } from 'express';
import {
  getAllFeedbacks,
  getFeedback,
  createFeedback,
  getFeedbackSummary
} from '../controllers/feedbackController.js';

const router = Router();

// /summary must be declared BEFORE /:id, or Express treats "summary" as an id.
router.get('/summary', getFeedbackSummary);

router.get('/', getAllFeedbacks);
router.post('/', createFeedback);
router.get('/:id', getFeedback);

export default router;