import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topicsToRevise: [{ type: String }],
    weakSubjects: [{ type: String }],
    practiceQuestions: [{ type: String }],
    dailyGoals: [{ type: String }],
    learningStrategy: { type: String, default: '' },
    insights: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Recommendation', recommendationSchema);
