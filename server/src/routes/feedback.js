import express from 'express';
const router = express.Router();
import * as feedbackController from '../controllers/feedbackController.js';

router.post('/', feedbackController.createFeedback);
router.get('/summary', feedbackController.getFeedbackSummary);
router.get('/', feedbackController.getAllFeedbacks);
router.get('/:id', feedbackController.getFeedback);

export default router;
