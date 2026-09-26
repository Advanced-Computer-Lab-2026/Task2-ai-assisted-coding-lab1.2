import { Router } from 'express';
import {
  getAllFeedbacks,
  getFeedback,
  createFeedback,
  getFeedbackSummary
} from '../controllers/feedbackController.js';

const router = Router();

router.get('/summary', getFeedbackSummary);
router.post('/', createFeedback);
router.get('/', getAllFeedbacks);
router.get('/:id', getFeedback);

export default router;
