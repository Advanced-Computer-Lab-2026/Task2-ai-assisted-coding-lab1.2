import Joi from 'joi';
import { Feedback } from '../models/Feedback.js';

const feedbackSchema = Joi.object({
  eventCode: Joi.string().required(),
  score: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().optional(),
  submittedBy: Joi.string().hex().length(24).optional(),
});

export async function createFeedback(req, res, next) {
  try {
    const { error, value } = feedbackSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const feedback = await Feedback.create(value);
    res.status(201).json({ feedback });
  } catch (err) {
    next(err);
  }
}

export async function getAllFeedbacks(req, res, next) {
  try {
    const feedbacks = await Feedback.find({});
    res.status(200).json({ feedbacks });
  } catch (err) {
    next(err);
  }
}

export async function getFeedback(req, res, next) {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(200).json({ feedback });
  } catch (err) {
    next(err);
  }
}

export async function getFeedbackSummary(req, res, next) {
  try {
    const { eventCode } = req.query;

    if (!eventCode) {
      return res.status(400).json({ message: 'eventCode is required' });
    }

    const summaryResult = await Feedback.aggregate([
      { $match: { eventCode: eventCode } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          feedbackCount: { $sum: 1 },
        },
      },
    ]);

    if (summaryResult.length === 0) {
      return res.status(200).json({
        eventCode,
        averageScore: 0,
        feedbackCount: 0,
      });
    }

    const { averageScore, feedbackCount } = summaryResult[0];
    res.status(200).json({
      eventCode,
      averageScore,
      feedbackCount,
    });
  } catch (err) {
    next(err);
  }
}
