import express from 'express';
import * as feedbackController from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedbacks);
router.get('/summary', feedbackController.getFeedbackSummary);
router.get('/:id', feedbackController.getFeedback);

export default router;
