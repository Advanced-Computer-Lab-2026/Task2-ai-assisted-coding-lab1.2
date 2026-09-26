import Joi from 'joi';
import mongoose from 'mongoose';
import { Feedback } from '../models/Feedback.js';

const createSchema = Joi.object({
  eventCode: Joi.string().trim().min(1).max(60).required(),
  score: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow('').max(1000),
  submittedBy: Joi.string().hex().length(24)
});

const summarySchema = Joi.object({
  eventCode: Joi.string().trim().min(1).required().messages({
    'any.required': 'eventCode is required',
    'string.empty': 'eventCode is required'
  })
}).unknown(true);

// GET /api/feedback
export async function getAllFeedbacks(req, res, next) {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
    res.json({ feedbacks });
  } catch (err) { next(err); }
}

// GET /api/feedback/:id
export async function getFeedback(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ feedback });
  } catch (err) { next(err); }
}

// POST /api/feedback
export async function createFeedback(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const feedback = await Feedback.create(value);
    res.status(201).json({ feedback });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Feedback already submitted for this event' });
    }
    next(err);
  }
}

// GET /api/feedback/summary?eventCode=EV101
export async function getFeedbackSummary(req, res, next) {
  try {
    const { value, error } = summarySchema.validate(req.query);
    if (error) return res.status(400).json({ message: 'eventCode is required' });

    const eventCode = value.eventCode;
    const [summary] = await Feedback.aggregate([
      { $match: { eventCode } },
      { $group: { _id: '$eventCode', averageScore: { $avg: '$score' }, feedbackCount: { $sum: 1 } } }
    ]);

    res.json({
      eventCode,
      averageScore: summary ? summary.averageScore : 0,
      feedbackCount: summary ? summary.feedbackCount : 0
    });
  } catch (err) { next(err); }
}
