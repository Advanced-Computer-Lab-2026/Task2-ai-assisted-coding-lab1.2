import mongoose from 'mongoose';

// TODO: define the Feedback schema per README.md section 1.

const feedbackSchema = new mongoose.Schema(
  {
    // TODO
  },
  { timestamps: true }
);

// TODO: add the compound uniqueness constraint described in README.md section 1.

export const Feedback = mongoose.model('Feedback', feedbackSchema);
