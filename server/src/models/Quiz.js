import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ['mcq', 'truefalse', 'short'],
    default: 'mcq',
  },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
});

const quizSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    subject: { type: String, default: 'General' },
    questions: [questionSchema],
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);
