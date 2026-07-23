import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    timeTaken: { type: Number, default: 0 },
    answers: [
      {
        question: { type: String, required: true },
        userAnswer: { type: String, default: '' },
        correctAnswer: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('QuizAttempt', quizAttemptSchema);
