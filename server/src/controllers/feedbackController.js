import { Feedback } from '../models/Feedback.js';

// POST /api/feedback
export async function createFeedback(req, res, next) {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json({ feedback });
  } catch (err) {
    next(err);
  }
}

// GET /api/feedback
export async function getAllFeedbacks(req, res, next) {
  try {
    const feedbacks = await Feedback.find();
    res.json({ feedbacks });
  } catch (err) {
    next(err);
  }
}

// GET /api/feedback/:id
export async function getFeedback(req, res, next) {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
}

// GET /api/feedback/summary
export async function getFeedbackSummary(req, res, next) {
  try {
    const { eventCode } = req.query;
    if (!eventCode) return res.status(400).json({ message: 'eventCode is required' });

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

    const { averageScore, feedbackCount } = result[0];
    res.json({
      eventCode,
      averageScore,
      feedbackCount
    });
  } catch (err) {
    next(err);
  }
}
