import { Router } from 'express';
import {
  createFeedback,
  getAllFeedbacks,
  getFeedback,
  getFeedbackSummary
} from '../controllers/feedbackController.js';

const router = Router();

router.post('/', createFeedback);
router.get('/', getAllFeedbacks);
router.get('/summary', getFeedbackSummary);
router.get('/:id', getFeedback);

export default router;
