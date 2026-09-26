import { Feedback } from '../models/Feedback.js';

// GET /api/feedback
// TODO: implement per README.md section 2.
export async function getAllFeedbacks(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}

// GET /api/feedback/:id
// TODO: implement per README.md section 2.
export async function getFeedback(req, res, next) {
  try {
    // TODO
    const feedback = await Feedback.findById(req.params.id).populate('submittedBy');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json(feedback);
  } catch (err) { next(err); }
}

// POST /api/feedback
// TODO: implement per README.md section 2.
export async function createFeedback(req, res, next) {
  try {
    // TODO
    const feedback = await Feedback.create(req.body);

    res.status(201).json(feedback);
  } catch (err) { next(err); }
}

// GET /api/feedback/summary?eventCode=EV101
// TODO: implement per README.md section 3.
export async function getFeedbackSummary(req, res, next) {
  try {
    // TODO
     const { eventCode } = req.query;

    if (!eventCode) {
      return res.status(400).json({
        message: 'eventCode is required',
      });
    }

    const summary = await Feedback.aggregate([
      {
        $match: { eventCode: eventCode },
      },
      {
        $group: {
          _id: '$eventCode',
          averageScore: { $avg: '$score' },
          totalFeedbacks: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(summary);
  } catch (err) { next(err); }
}
