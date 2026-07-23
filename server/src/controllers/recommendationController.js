import Recommendation from '../models/Recommendation.js';
import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import QuizAttempt from '../models/QuizAttempt.js';
import StudySession from '../models/StudySession.js';
import { generateRecommendations, isGeminiConfigured } from '../services/geminiService.js';

const sampleRecommendations = (context) => {
  return {
    topicsToRevise: context.subjects.length ? [`${context.subjects[0]} fundamentals`, 'Key formulas', 'Important definitions'] : ['Review your most recent study material'],
    weakSubjects: context.subjects.length ? [context.subjects[0]] : [],
    practiceQuestions: ['Solve 5 practice problems daily', 'Take a timed quiz', 'Review past mistakes'],
    dailyGoals: ['Study for 2 hours', 'Complete 10 flashcards', 'Take one quiz', 'Review yesterday\'s notes'],
    learningStrategy: 'Focus on active recall and spaced repetition. Break your study sessions into 25-minute focused blocks (Pomodoro) with 5-minute breaks. Review material at increasing intervals (1 day, 3 days, 1 week) to strengthen memory retention.',
    insights: [
      `You've studied ${context.studyHours} hours total`,
      `Your current streak is ${context.streak} days`,
      `Average quiz score: ${context.avgScore}%`,
    ],
  };
};

export const getRecommendations = async (req, res) => {
  const userId = req.user._id;

  const [documents, flashcards, attempts, sessions] = await Promise.all([
    Document.find({ user: userId }).distinct('subject'),
    Flashcard.countDocuments({ user: userId }),
    QuizAttempt.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
    StudySession.find({ user: userId }).sort({ date: -1 }).limit(30),
  ]);

  const avgScore = attempts.length
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
    : 0;

  const recentScores = attempts.slice(0, 5).map((a) => ({
    score: a.percentage,
    date: a.createdAt,
  }));

  const context = {
    studyHours: req.user.studyHours,
    streak: req.user.streak,
    documentsCount: documents.length,
    flashcardsCount: flashcards,
    quizzesCount: attempts.length,
    avgScore,
    subjects: documents,
    recentScores,
  };

  let recommendations;
  if (isGeminiConfigured()) {
    try {
      recommendations = await generateRecommendations(context);
    } catch (error) {
      recommendations = sampleRecommendations(context);
    }
  } else {
    recommendations = sampleRecommendations(context);
  }

  const saved = await Recommendation.create({
    user: userId,
    ...recommendations,
  });

  res.json({ success: true, recommendations: saved });
};

export const getRecommendationHistory = async (req, res) => {
  const recs = await Recommendation.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(10);
  res.json({ success: true, recommendations: recs });
};
