import mongoose from 'mongoose';
import Feedback from '../models/Feedback.js';

// POST /api/feedback
export const createFeedback = async (req, res, next) => {
  try {
    const { eventCode, score, comment, submittedBy } = req.body;

    const feedback = await Feedback.create({
      eventCode,
      score,
      comment,
      submittedBy,
    });

    return res.status(201).json({ feedback });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Feedback already submitted for this event by this user' });
    }
    next(err);
  }
};

// GET /api/feedback
export const getAllFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find();
    return res.status(200).json({ feedbacks });
  } catch (err) {
    next(err);
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
    next(err);
  }
};

// GET /api/feedback/:id
export const getFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    return res.status(200).json({ feedback });
  } catch (err) {
    next(err);
  }
};