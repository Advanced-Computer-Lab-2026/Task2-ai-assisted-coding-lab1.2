import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    eventCode: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Compound unique index: a given user can only submit feedback
// once per event (submittedBy can be null/absent for anonymous ones).
feedbackSchema.index({ eventCode: 1, submittedBy: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;