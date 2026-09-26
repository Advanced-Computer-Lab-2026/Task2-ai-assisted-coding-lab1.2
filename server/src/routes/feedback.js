import express from 'express';
import * as feedbackController from '../controllers/feedbackController.js';

const router = express.Router();

router.get('/summary', feedbackController.getFeedbackSummary);
router.get('/', feedbackController.getAllFeedbacks);
router.get('/:id', feedbackController.getFeedback);
router.post('/', feedbackController.createFeedback);

export default router;
