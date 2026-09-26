import Joi from 'joi';
import { Feedback } from '../models/Feedback.js';

// GET /api/feedback
// TODO: implement per README.md section 2.
export async function getAllFeedbacks(req, res, next) {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json({ feedbacks });
  } catch (err) { next(err); }
}

// GET /api/feedback/:id
// TODO: implement per README.md section 2.
export async function getFeedback(req, res, next) {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.status(200).json({ feedback });
  } catch (err) { next(err); }
}

// POST /api/feedback
// TODO: implement per README.md section 2.
export async function createFeedback(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);
  if (error) {
      return res.status(400).json({
        message: error.message
      });
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
      return res.status(400).json({ error: 'eventCode query parameter is required' });
    }
    const results = await Feedback.aggregate([
      { $match: { eventCode } },
      {
        $group: {
          _id: '$eventCode',
          averageScore: { $avg: '$score' },
          totalFeedbacks: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({
      eventCode,
      averageScore: results[0].averageScore,
      feedbackCount: results[0].feedbackCount
    });
  } catch (err) { next(err); }
}
