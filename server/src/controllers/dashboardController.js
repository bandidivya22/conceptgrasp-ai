import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import StudySession from '../models/StudySession.js';

export const getDashboard = async (req, res) => {
  const userId = req.user._id;

  const [documents, flashcards, quizzes, attempts, sessions] = await Promise.all([
    Document.countDocuments({ user: userId }),
    Flashcard.countDocuments({ user: userId }),
    Quiz.countDocuments({ user: userId }),
    QuizAttempt.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
    StudySession.find({ user: userId }).sort({ date: -1 }).limit(30),
  ]);

  const learnedFlashcards = await Flashcard.countDocuments({ user: userId, learned: true });

  const totalQuizScore = attempts.reduce((sum, a) => sum + a.percentage, 0);
  const avgScore = attempts.length ? Math.round(totalQuizScore / attempts.length) : 0;

  const weeklyHours = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    day.setHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const daySessions = sessions.filter((s) => s.date >= day && s.date < next);
    const hours = daySessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    return {
      day: day.toLocaleDateString('en-US', { weekday: 'short' }),
      hours: Math.round(hours * 10) / 10,
    };
  });

  const quizPerformance = attempts.slice(0, 6).reverse().map((a, i) => ({
    attempt: `Quiz ${i + 1}`,
    score: a.percentage,
  }));

  const subjectMap = new Map();
  sessions.forEach((s) => {
    const current = subjectMap.get(s.subject) || 0;
    subjectMap.set(s.subject, current + s.duration);
  });
  const subjectProgress = Array.from(subjectMap.entries())
    .map(([subject, minutes]) => ({
      subject,
      hours: Math.round((minutes / 60) * 10) / 10,
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 6);

  const recentActivities = [];
  if (documents > 0) recentActivities.push({ icon: 'FileText', text: `Uploaded ${documents} document${documents !== 1 ? 's' : ''}`, time: 'Recently' });
  if (flashcards > 0) recentActivities.push({ icon: 'Layers', text: `Created ${flashcards} flashcards`, time: 'Recently' });
  if (quizzes > 0) recentActivities.push({ icon: 'HelpCircle', text: `Generated ${quizzes} quizzes`, time: 'Recently' });
  if (attempts.length) recentActivities.push({ icon: 'Trophy', text: `Latest quiz score: ${attempts[0].percentage}%`, time: 'Recently' });
  if (learnedFlashcards > 0) recentActivities.push({ icon: 'CheckCircle', text: `Learned ${learnedFlashcards} flashcards`, time: 'Recently' });

  res.json({
    success: true,
    stats: {
      documents,
      flashcards,
      quizzes,
      studyHours: req.user.studyHours,
      streak: req.user.streak,
      avgScore,
      learnedFlashcards,
    },
    charts: {
      weeklyHours,
      quizPerformance,
      subjectProgress,
    },
    recentActivities,
  });
};
