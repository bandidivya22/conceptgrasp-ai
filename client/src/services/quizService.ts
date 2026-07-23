import { api } from './api';
import type { Quiz, QuizAttempt, QuizQuestion } from '../types';

export interface GenerateQuizPayload {
  content?: string;
  subject?: string;
  count?: number;
  documentId?: string;
}

export interface SubmitQuizPayload {
  quizId: string;
  answers: string[];
  timeTaken: number;
}

const toQuiz = (d: any): Quiz => ({
  id: d._id || d.id,
  title: d.title,
  subject: d.subject,
  questions: (d.questions || []) as QuizQuestion[],
  created_at: d.createdAt || d.created_at || '',
});

const toAttempt = (d: any): QuizAttempt => ({
  id: d._id || d.id,
  quiz_id: d.quiz?._id || d.quiz?._id || d.quiz_id || d.quiz,
  quiz: d.quiz
    ? { id: d.quiz._id || d.quiz.id, title: d.quiz.title || '', subject: d.quiz.subject || '' }
    : undefined,
  score: d.score,
  total_questions: d.totalQuestions || d.total_questions || 0,
  percentage: d.percentage,
  time_taken: d.timeTaken ?? d.time_taken ?? 0,
  answers: (d.answers || []) as any[],
  created_at: d.createdAt || d.created_at || '',
});

export const quizService = {
  async generate(payload: GenerateQuizPayload): Promise<Quiz> {
    const { data } = await api.post('/quizzes/generate', {
      content: payload.content || '',
      subject: payload.subject || 'General',
      count: payload.count || 5,
      documentId: payload.documentId,
    });
    return toQuiz(data.quiz);
  },

  async submit(payload: SubmitQuizPayload): Promise<QuizAttempt> {
    const { data } = await api.post('/quizzes/submit', {
      quizId: payload.quizId,
      answers: payload.answers,
      timeTaken: payload.timeTaken,
    });
    return toAttempt(data.attempt);
  },

  async getHistory(): Promise<QuizAttempt[]> {
    const { data } = await api.get('/quizzes/history');
    return (data.attempts || []).map(toAttempt);
  },

  async getAll(): Promise<Quiz[]> {
    const { data } = await api.get('/quizzes');
    return (data.quizzes || []).map(toQuiz);
  },

  async getById(id: string): Promise<Quiz | null> {
    try {
      const { data } = await api.get(`/quizzes/${id}`);
      return toQuiz(data.quiz);
    } catch (err: any) {
      if (err.message?.includes('not found') || err.message?.includes('404')) return null;
      throw err;
    }
  },
};
