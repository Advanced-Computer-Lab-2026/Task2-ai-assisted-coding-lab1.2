import express from 'express';
const router = express.Router();
import * as feedbackController from '../controllers/feedbackController.js';

router.get('/summary', feedbackController.getFeedbackSummary);
router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedback);
router.get('/:id', feedbackController.getFeedbackById);

export default router;
