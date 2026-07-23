import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    subject: { type: String, default: 'General' },
    bookmarked: { type: Boolean, default: false },
    learned: { type: Boolean, default: false },
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
  },
  { timestamps: true }
);

flashcardSchema.index({ user: 1, subject: 1 });
export default mongoose.model('Flashcard', flashcardSchema);
