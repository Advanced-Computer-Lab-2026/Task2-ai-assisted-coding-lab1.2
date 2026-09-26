import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  eventCode: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Prevent duplicate feedback per user per event
feedbackSchema.index({ eventCode: 1, submittedBy: 1 }, { unique: true });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
