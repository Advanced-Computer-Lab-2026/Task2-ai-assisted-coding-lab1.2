import { Feedback } from '../models/Feedback.js';

export async function createFeedback(req, res, next) {
  try {
    const { eventCode, score, comment, submittedBy } = req.body;
    const feedback = await Feedback.create({ eventCode, score, comment, submittedBy });
    res.status(201).json({ feedback });
  } catch (err) {
    next(err);
  }
}

export async function getAllFeedbacks(req, res, next) {
  try {
    const feedbacks = await Feedback.find().lean();
    res.json({ feedbacks });
  } catch (err) {
    next(err);
  }
}

export async function getFeedback(req, res, next) {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
}

export async function getFeedbackSummary(req, res, next) {
  try {
    const { eventCode } = req.query;
    if (!eventCode) return res.status(400).json({ message: 'eventCode is required' });

    const stats = await Feedback.aggregate([
      { $match: { eventCode } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          feedbackCount: { $sum: 1 }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        eventCode,
        averageScore: 0,
        feedbackCount: 0
      });
    }

    const { averageScore, feedbackCount } = stats[0];
    res.json({
      eventCode,
      averageScore,
      feedbackCount
    });
  } catch (err) {
    next(err);
  }
}
