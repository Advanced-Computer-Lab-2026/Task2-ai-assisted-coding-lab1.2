import Feedback from '../models/Feedback.js';

// POST /api/feedback
export const createFeedback = async (req, res, next) => {
  try {
    const { eventCode, score, comment, submittedBy } = req.body;

    if (!eventCode || score === undefined) {
      return res.status(400).json({ message: 'eventCode and score are required' });
    }

    const feedback = await Feedback.create({
      eventCode,
      score,
      comment,
      submittedBy,
    });

    return res.status(201).json({ feedback });
  } catch (err) {
    return next(err);
  }
};

// GET /api/feedback
export const getAllFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find();
    return res.status(200).json({ feedbacks });
  } catch (err) {
    return next(err);
  }
};

// GET /api/feedback/:id
export const getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    return res.status(200).json({ feedback });
  } catch (err) {
    return next(err);
  }
};

// GET /api/feedback/summary?eventCode=EV101
export const getFeedbackSummary = async (req, res, next) => {
  try {
    const { eventCode } = req.query;

    if (!eventCode) {
      return res.status(400).json({ message: 'eventCode is required' });
    }

    const result = await Feedback.aggregate([
      { $match: { eventCode } },
      {
        $group: {
          _id: '$eventCode',
          averageScore: { $avg: '$score' },
          feedbackCount: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(200).json({
        eventCode,
        averageScore: 0,
        feedbackCount: 0,
      });
    }

    return res.status(200).json({
      eventCode,
      averageScore: result[0].averageScore,
      feedbackCount: result[0].feedbackCount,
    });
  } catch (err) {
    return next(err);
  }
};