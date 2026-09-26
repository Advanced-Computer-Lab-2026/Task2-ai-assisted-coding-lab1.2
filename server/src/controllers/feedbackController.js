import Joi from 'joi';
import { Feedback } from '../models/Feedback.js';

const createSchema = Joi.object({
  eventCode: Joi.string().required(),
  score: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow('').optional(),
  submittedBy: Joi.string().hex().length(24).optional()
});

// GET /api/feedback
export async function getAllFeedbacks(req, res, next) {
  try {
    const feedbacks = await Feedback.find({}, { __v: 0 }).sort({ createdAt: -1 }).lean();
    return res.json({ feedbacks });
  } catch (err) {
    return next(err);
  }
}

// GET /api/feedback/:id
export async function getFeedback(req, res, next) {
  try {
    const feedback = await Feedback.findById(req.params.id, { __v: 0 }).lean();
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    return res.json({ feedback });
  } catch (err) {
    return next(err);
  }
}

// POST /api/feedback
export async function createFeedback(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const feedback = await Feedback.create(value);
    return res.status(201).json({ feedback: feedback.toObject({ versionKey: false }) });
  } catch (err) {
    return next(err);
  }
}

// GET /api/feedback/summary?eventCode=EV101
export async function getFeedbackSummary(req, res, next) {
  try {
    const eventCode = String(req.query.eventCode ?? '').trim();
    if (!eventCode) {
      return res.status(400).json({ message: 'eventCode is required' });
    }

    const [summary] = await Feedback.aggregate([
      { $match: { eventCode } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          feedbackCount: { $sum: 1 }
        }
      }
    ]);

    if (!summary) {
      return res.json({ eventCode, averageScore: 0, feedbackCount: 0 });
    }

    return res.json({
      eventCode,
      averageScore: Number(summary.averageScore),
      feedbackCount: summary.feedbackCount
    });
  } catch (err) {
    return next(err);
  }
}
