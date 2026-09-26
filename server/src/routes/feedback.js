import { Router } from 'express';
import {
  getAllFeedbacks,
  getFeedback,
  createFeedback,
  getFeedbackSummary
} from '../controllers/feedbackController.js';

const router = Router();

router.get('/', getAllFeedbacks);
router.post('/', createFeedback);
router.get('/summary', getFeedbackSummary);
router.get('/:id', getFeedback);
export default router;
