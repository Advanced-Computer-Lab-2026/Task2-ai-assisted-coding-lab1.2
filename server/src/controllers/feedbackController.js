import Joi from 'joi';
import { Feedback } from '../models/Feedback.js';

const createSchema = Joi.object({
  eventCode: Joi.string().required(),
  score: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow(''),
  submittedBy: Joi.string().hex().length(24)
});

// POST /api/feedback
export async function createFeedback(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const feedback = await Feedback.create(value);
    res.status(201).json({ feedback });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Feedback already submitted for this event by this user' });
    }
    next(err);
  }
}

// GET /api/feedback
export async function getAllFeedback(req, res, next) {
  try {
    const feedbackList = await Feedback.find().populate('submittedBy', 'name email').sort({ createdAt: -1 });
    res.json({ feedbacks: feedbackList });
  } catch (err) { next(err); }
}

// GET /api/feedback/summary
export async function getFeedbackSummary(req, res, next) {
  try {
    const { eventCode } = req.query;
    if (!eventCode) return res.status(400).json({ message: 'eventCode is required' });

    const results = await Feedback.aggregate([
      { $match: { eventCode } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          feedbackCount: { $sum: 1 }
        }
      }
    ]);

    if (results.length === 0) {
      return res.json({ eventCode, averageScore: 0, feedbackCount: 0 });
    }

    const { averageScore, feedbackCount } = results[0];
    res.json({ eventCode, averageScore, feedbackCount });
  } catch (err) { next(err); }
}

// GET /api/feedback/:id
export async function getFeedbackById(req, res, next) {
  try {
    const feedback = await Feedback.findById(req.params.id).populate('submittedBy', 'name email');
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ feedback });
  } catch (err) { next(err); }
}
