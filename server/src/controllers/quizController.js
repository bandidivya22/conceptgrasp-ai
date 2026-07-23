import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import StudySession from '../models/StudySession.js';
import Document from '../models/Document.js';
import { generateQuiz, isGeminiConfigured } from '../services/geminiService.js';

const sampleQuiz = (subject, count) => {
  const samples = [
    {
      question: 'What is the powerhouse of the cell?',
      type: 'mcq',
      options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'],
      correctAnswer: 'Mitochondria',
      explanation: 'The mitochondria produces ATP through cellular respiration.',
      difficulty: 'easy',
    },
    {
      question: 'The Earth revolves around the Sun.',
      type: 'truefalse',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'The Earth orbits the Sun in an elliptical path.',
      difficulty: 'easy',
    },
    {
      question: 'Explain the concept of supply and demand.',
      type: 'short',
      options: [],
      correctAnswer: 'Supply and demand is the relationship between the quantity of a product available and the desire of buyers for it, determining price.',
      explanation: 'When demand exceeds supply, prices rise; when supply exceeds demand, prices fall.',
      difficulty: 'medium',
    },
    {
      question: 'Which planet is known as the Red Planet?',
      type: 'mcq',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 'Mars',
      explanation: 'Mars appears red due to iron oxide on its surface.',
      difficulty: 'easy',
    },
    {
      question: 'Water boils at 100 degrees Celsius at sea level.',
      type: 'truefalse',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'At standard atmospheric pressure, water boils at 100°C.',
      difficulty: 'easy',
    },
  ];
  return samples.slice(0, count);
};

export const generateQuizController = async (req, res) => {
  const { content, subject = 'General', count = 5, documentId } = req.body;

  let sourceContent = content || '';
  if (!sourceContent && documentId) {
    const doc = await Document.findOne({ _id: documentId, user: req.user._id });
    if (doc) {
      sourceContent = `Document: ${doc.title}. ${doc.description}`;
    }
  }

  if (!sourceContent) {
    res.status(400);
    throw new Error('Content or documentId is required');
  }

  let questions;
  if (isGeminiConfigured()) {
    try {
      questions = await generateQuiz(sourceContent, subject, count);
    } catch (error) {
      questions = sampleQuiz(subject, count);
    }
  } else {
    questions = sampleQuiz(subject, count);
  }

  const quiz = await Quiz.create({
    user: req.user._id,
    title: `${subject} Quiz - ${new Date().toLocaleDateString()}`,
    subject,
    questions,
    document: documentId || null,
  });

  res.status(201).json({ success: true, quiz });
};

export const submitQuiz = async (req, res) => {
  const { quizId, answers, timeTaken } = req.body;

  const quiz = await Quiz.findOne({ _id: quizId, user: req.user._id });
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  let correctCount = 0;
  const detailedAnswers = quiz.questions.map((q, i) => {
    const userAnswer = answers[i] || '';
    const isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    if (isCorrect) correctCount++;
    return {
      question: q.question,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
    };
  });

  const percentage = Math.round((correctCount / quiz.questions.length) * 100);

  const attempt = await QuizAttempt.create({
    user: req.user._id,
    quiz: quiz._id,
    score: correctCount,
    totalQuestions: quiz.questions.length,
    percentage,
    timeTaken: timeTaken || 0,
    answers: detailedAnswers,
  });

  await StudySession.create({
    user: req.user._id,
    subject: quiz.subject,
    duration: Math.round((timeTaken || 0) / 60),
    activity: 'quiz',
  });

  const user = req.user;
  user.studyHours = (user.studyHours || 0) + Math.round((timeTaken || 0) / 3600 * 10) / 10;
  await user.save();

  res.json({ success: true, attempt });
};

export const getQuizHistory = async (req, res) => {
  const attempts = await QuizAttempt.find({ user: req.user._id })
    .populate('quiz', 'title subject')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({ success: true, attempts });
};

export const getQuizzes = async (req, res) => {
  const quizzes = await Quiz.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, quizzes });
};

export const getQuizById = async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }
  res.json({ success: true, quiz });
};
