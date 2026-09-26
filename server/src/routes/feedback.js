import express from 'express';
import * as feedbackController from '../controllers/feedbackController.js';

const router = express.Router();

// Summary must come before :id to avoid being captured by the parameter
router.get('/summary', feedbackController.getFeedbackSummary);

router.get('/', feedbackController.getAllFeedbacks);
router.post('/', feedbackController.createFeedback);
router.get('/:id', feedbackController.getFeedback);

export default router;
