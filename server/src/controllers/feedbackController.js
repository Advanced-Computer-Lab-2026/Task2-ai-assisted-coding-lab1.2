import mongoose from 'mongoose';
import Joi from 'joi';
import { Feedback } from '../models/Feedback.js';

const createSchema = Joi.object({
  eventCode: Joi.string().required(),
  score: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow('', null),
  submittedBy: Joi.string().hex().length(24)
});

// GET /api/feedback
export async function getAllFeedbacks(req, res, next) {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({ feedbacks });
  } catch (err) { next(err); }
}

// GET /api/feedback/:id
export async function getFeedback(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.status(200).json({ feedback });
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

    const result = await Feedback.aggregate([
      { $match: { eventCode } },
      { $group: { _id: '$eventCode', averageScore: { $avg: '$score' }, feedbackCount: { $sum: 1 } } }
    ]);

    if (result.length === 0) {
      return res.status(200).json({ eventCode, averageScore: 0, feedbackCount: 0 });
    }

    res.status(200).json({
      eventCode,
      averageScore: result[0].averageScore,
      feedbackCount: result[0].feedbackCount
    });
  } catch (err) { next(err); }
}
