import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, default: 'General' },
    duration: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    activity: {
      type: String,
      enum: ['study', 'quiz', 'flashcard', 'chat'],
      default: 'study',
    },
  },
  { timestamps: true }
);

studySessionSchema.index({ user: 1, date: -1 });
export default mongoose.model('StudySession', studySessionSchema);
