import Joi from 'joi';
import { Feedback } from '../models/Feedback.js';

const createSchema = Joi.object({
  eventCode: Joi.string().trim().required(),
  score: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow('').optional(),
  submittedBy: Joi.string().hex().length(24).optional()
});

// GET /api/feedback
export async function getAllFeedbacks(req, res, next) {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({ feedbacks });
  } catch (err) { next(err); }
}

// GET /api/feedback/:id
export async function getFeedback(req, res, next) {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ feedback });
  } catch (err) { next(err); }
}

// POST /api/feedback
export async function createFeedback(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const feedback = await Feedback.create(value);
    res.status(201).json({ feedback });
  } catch (err) { next(err); }
}

// GET /api/feedback/summary?eventCode=EV101
export async function getFeedbackSummary(req, res, next) {
  try {
    const { eventCode } = req.query;
    if (!eventCode) return res.status(400).json({ message: 'eventCode is required' });

    const [summary] = await Feedback.aggregate([
      { $match: { eventCode } },
      {
        $group: {
          _id: '$eventCode',
          averageScore: { $avg: '$score' },
          feedbackCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      eventCode,
      averageScore: summary?.averageScore ?? 0,
      feedbackCount: summary?.feedbackCount ?? 0
    });
  } catch (err) { next(err); }
}
