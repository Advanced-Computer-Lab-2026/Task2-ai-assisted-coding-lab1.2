import { Feedback } from '../models/Feedback.js';

export const createFeedback = async (req, res, next) => {
  try {
    const { eventCode, score, comment, submittedBy } = req.body;
    const feedback = await Feedback.create({
      eventCode,
      score,
      comment,
      submittedBy,
    });
    res.status(201).json({ feedback });
  } catch (err) {
    next(err);
  }
};

export const getAllFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find().lean();
    res.status(200).json({ feedbacks });
  } catch (err) {
    next(err);
  }
};

export const getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id).lean();
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(200).json({ feedback });
  } catch (err) {
    next(err);
  }
};

export const getFeedbackSummary = async (req, res, next) => {
  try {
    const { eventCode } = req.query;
    if (!eventCode) {
      return res.status(400).json({ message: 'eventCode is required' });
    }

    const results = await Feedback.aggregate([
      { $match: { eventCode } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          feedbackCount: { $sum: 1 },
        },
      },
    ]);

    if (results.length === 0) {
      return res.status(200).json({
        eventCode,
        averageScore: 0,
        feedbackCount: 0,
      });
    }

    const { averageScore, feedbackCount } = results[0];
    res.status(200).json({
      eventCode,
      averageScore,
      feedbackCount,
    });
  } catch (err) {
    next(err);
  }
};
