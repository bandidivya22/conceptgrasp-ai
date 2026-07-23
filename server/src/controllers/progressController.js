import Flashcard from '../models/Flashcard.js';
import QuizAttempt from '../models/QuizAttempt.js';
import StudySession from '../models/StudySession.js';
import Document from '../models/Document.js';

export const getProgress = async (req, res) => {
  const userId = req.user._id;

  const [attempts, sessions, flashcards, documents] = await Promise.all([
    QuizAttempt.find({ user: userId }).sort({ createdAt: -1 }).limit(30),
    StudySession.find({ user: userId }).sort({ date: -1 }).limit(60),
    Flashcard.find({ user: userId }),
    Document.find({ user: userId }),
  ]);

  const totalQuizScore = attempts.reduce((sum, a) => sum + a.percentage, 0);
  const avgScore = attempts.length ? Math.round(totalQuizScore / attempts.length) : 0;
  const bestScore = attempts.length ? Math.max(...attempts.map((a) => a.percentage)) : 0;

  const learnedFlashcards = flashcards.filter((f) => f.learned).length;
  const bookmarkedFlashcards = flashcards.filter((f) => f.bookmarked).length;

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (29 - i));
    day.setHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const daySessions = sessions.filter((s) => s.date >= day && s.date < next);
    const minutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
    return {
      date: day.toISOString().split('T')[0],
      hours: Math.round((minutes / 60) * 10) / 10,
    };
  });

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
    .sort((a, b) => b.hours - a.hours);

  const difficultyMap = { easy: 0, medium: 0, hard: 0 };
  flashcards.forEach((f) => {
    if (difficultyMap[f.difficulty] !== undefined) difficultyMap[f.difficulty]++;
  });

  const achievements = [];
  if (req.user.streak >= 3) achievements.push({ name: 'Getting Started', description: '3-day study streak', icon: 'Flame' });
  if (req.user.streak >= 7) achievements.push({ name: 'Week Warrior', description: '7-day study streak', icon: 'Trophy' });
  if (req.user.streak >= 30) achievements.push({ name: 'Month Master', description: '30-day study streak', icon: 'Crown' });
  if (documents.length >= 5) achievements.push({ name: 'Document Collector', description: 'Uploaded 5 documents', icon: 'FileText' });
  if (flashcards.length >= 20) achievements.push({ name: 'Flashcard Pro', description: 'Created 20 flashcards', icon: 'Layers' });
  if (attempts.length >= 10) achievements.push({ name: 'Quiz Master', description: 'Completed 10 quizzes', icon: 'HelpCircle' });
  if (avgScore >= 80) achievements.push({ name: 'High Achiever', description: 'Average quiz score 80%+', icon: 'Star' });
  if (learnedFlashcards >= 10) achievements.push({ name: 'Fast Learner', description: 'Learned 10 flashcards', icon: 'Bot' });

  res.json({
    success: true,
    progress: {
      stats: {
        studyHours: req.user.studyHours,
        streak: req.user.streak,
        totalQuizzes: attempts.length,
        avgScore,
        bestScore,
        totalFlashcards: flashcards.length,
        learnedFlashcards,
        bookmarkedFlashcards,
        totalDocuments: documents.length,
      },
      charts: {
        studyHours30Days: last30Days,
        subjectProgress,
        difficultyDistribution: Object.entries(difficultyMap).map(([difficulty, count]) => ({ difficulty, count })),
        quizScores: attempts.slice(0, 15).reverse().map((a, i) => ({
          attempt: `Q${i + 1}`,
          score: a.percentage,
        })),
      },
      achievements,
    },
  });
};
