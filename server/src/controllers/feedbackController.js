import { Feedback } from '../models/Feedback.js';

// GET /api/feedback
// TODO: implement per README.md section 2.
export async function getAllFeedbacks(req, res, next) {
  try {
    // TODO
    const feedbacks = await Feedback.find();
    res.status(200).json({ feedbacks });
  } catch (err) { next(err); }
}

// GET /api/feedback/:id
// TODO: implement per README.md section 2.
export async function getFeedback(req, res, next) {
  try {
    // TODO
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    res.status(200).json({ feedback });
  } catch (err) { next(err); }
}

// POST /api/feedback
// TODO: implement per README.md section 2.
export async function createFeedback(req, res, next) {
  try {
    // TODO
    const feedback = await Feedback.create(req.body);
    res.status(201).json({ feedback });
  } catch (err) { next(err); }
}

// GET /api/feedback/summary?eventCode=EV101
// TODO: implement per README.md section 3.
export async function getFeedbackSummary(req, res, next) {
  try {
    const { eventCode } = req.query;

    // 1. Validation: eventCode query parameter is required
    if (!eventCode) {
      return res.status(400).json({ message: 'eventCode is required' });
    }

    // 2. Aggregation pipeline
    const stats = await Feedback.aggregate([
      { 
        $match: { eventCode: eventCode } 
      },
      { 
        $group: { 
          _id: null, // We don't need to group by a specific field, just calculate totals for the match
          averageScore: { $avg: '$score' }, 
          feedbackCount: { $sum: 1 } 
        } 
      }
    ]);

    // 3. Handle "no matches" case
    if (stats.length === 0) {
      return res.status(200).json({ 
        eventCode: eventCode, 
        averageScore: 0, 
        feedbackCount: 0 
      });
    }

    // 4. Return the calculated summary
    const result = stats[0];
    res.status(200).json({ 
      eventCode: eventCode, 
      averageScore: result.averageScore, 
      feedbackCount: result.feedbackCount 
    });
    // TODO
  } catch (err) { next(err); }
}
