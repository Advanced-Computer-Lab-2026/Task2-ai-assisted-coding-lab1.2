import Feedback from '../models/Feedback.js';

export const createFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.create(req.body);

    res.status(201).json({ feedback });
  } catch (err) {
    next(err);
  }
};

export const getAllFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find();

    res.status(200).json({ feedbacks });
  } catch (err) {
    next(err);
  }
};

export const getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        message: 'Feedback not found'
      });
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
      return res.status(400).json({
        message: 'eventCode is required'
      });
    }

    const result = await Feedback.aggregate([
      {
        $match: {
          eventCode
        }
      },
      {
        $group: {
          _id: '$eventCode',
          averageScore: { $avg: '$score' },
          feedbackCount: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(200).json({
        eventCode,
        averageScore: 0,
        feedbackCount: 0
      });
    }

    res.status(200).json({
      eventCode,
      averageScore: result[0].averageScore,
      feedbackCount: result[0].feedbackCount
    });
  } catch (err) {
    next(err);
  }
};