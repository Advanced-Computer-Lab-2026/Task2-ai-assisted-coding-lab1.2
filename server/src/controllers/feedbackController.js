import Feedback from '../models/Feedback.js';

export const createFeedback = async (req, res, next) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json({ feedback });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User has already submitted feedback for this event' });
    }
    next(error);
  }
};

export const getAllFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json({ feedbacks });
  } catch (error) {
    next(error);
  }
};

export const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(200).json({ feedback });
  } catch (error) {
    next(error);
  }
};

export const getFeedbackSummary = async (req, res, next) => {
  try {
    const { eventCode } = req.query;
    if (!eventCode) {
      return res.status(400).json({ message: 'eventCode is required' });
    }

    const summary = await Feedback.aggregate([
      { $match: { eventCode } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          feedbackCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          averageScore: 1,
          feedbackCount: 1
        }
      }
    ]);

    if (summary.length === 0) {
      return res.status(200).json({ eventCode, averageScore: 0, feedbackCount: 0 });
    }

    res.status(200).json({
      eventCode,
      averageScore: summary[0].averageScore,
      feedbackCount: summary[0].feedbackCount
    });
  } catch (error) {
    next(error);
  }
};
