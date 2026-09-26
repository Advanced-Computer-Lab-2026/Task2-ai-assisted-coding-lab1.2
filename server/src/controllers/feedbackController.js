import Feedback from '../models/Feedback.js';

export const createFeedback = async (req, res, next) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json({ feedback });
  } catch (error) {
    next(error);
  }
};

export const getAllFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json({ feedbacks });
  } catch (error) {
    next(error);
  }
};

export const getFeedback = async (req, res, next) => {
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
          _id: '$eventCode', 
          averageScore: { $avg: '$score' }, 
          feedbackCount: { $sum: 1 } 
        } 
      }
    ]);

    if (summary.length === 0) {
      return res.status(200).json({
        eventCode,
        averageScore: 0,
        feedbackCount: 0
      });
    }

    return res.status(200).json({
      eventCode: summary[0]._id,
      averageScore: summary[0].averageScore,
      feedbackCount: summary[0].feedbackCount
    });
  } catch (error) {
    next(error);
  }
};