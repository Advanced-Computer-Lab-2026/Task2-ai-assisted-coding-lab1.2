import { Router } from 'express';
import {
  getAllFeedbacks,
  getFeedback,
  createFeedback,
  getFeedbackSummary
} from '../controllers/feedbackController.js';

const router = Router();

router.get('/', getAllFeedbacks);
// Registered before '/:id' so the literal path is not captured by the id param.
router.get('/summary', getFeedbackSummary);
router.get('/:id', getFeedback);
router.post('/', createFeedback);

export default router;
