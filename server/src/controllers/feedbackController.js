import { Feedback } from '../models/Feedback.js';
import Joi from 'joi';

const createSchema = Joi.object({
  eventCode: Joi.string().required(),
  score: Joi.number().min(1).max(5).required(),
  comment: Joi.string().optional(),
  submittedBy: Joi.string().optional()
});

// GET /api/feedback
export async function getAllFeedbacks(req, res, next) {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({ feedbacks });
  } catch (err) { next(err); }
}

// GET /api/feedback/:id
// TODO: implement per README.md section 2.
export async function getFeedback(req, res, next) {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ feedback });
  } catch (err) { next(err); }
}

// POST /api/feedback
// TODO: implement per README.md section 2.
export async function createFeedback(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const feedback = await Feedback.create(value);

    res.status(201).json({ feedback });
  } catch (err) { next(err); }
}

// GET /api/feedback/summary?eventCode=EV101
// TODO: implement per README.md section 3.
export async function getFeedbackSummary(req, res, next) {
  try {
    const { eventCode } = req.query;

    if (!eventCode) {
      return res.status(400).json({ message: 'eventCode is required' });
    }

    const result = await Feedback.aggregate([
      { $match: { eventCode } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          feedbackCount: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({
        eventCode,
        averageScore: 0,
        feedbackCount: 0
      });
    }
    res.json({
      eventCode,
      averageScore: result[0].averageScore,
      feedbackCount: result[0].feedbackCount
    });

  } catch (err) { next(err); }
}
