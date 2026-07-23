import { api } from './api';
import type { Recommendations } from '../types';

const toRec = (d: any): Recommendations => ({
  id: d._id || d.id,
  topics_to_revise: d.topicsToRevise || d.topics_to_revise || [],
  weak_subjects: d.weakSubjects || d.weak_subjects || [],
  practice_questions: d.practiceQuestions || d.practice_questions || [],
  daily_goals: d.dailyGoals || d.daily_goals || [],
  learning_strategy: d.learningStrategy || d.learning_strategy || '',
  insights: d.insights || [],
  created_at: d.createdAt || d.created_at || '',
});

export const recommendationService = {
  async get(): Promise<Recommendations> {
    const { data } = await api.get('/recommendations');
    return toRec(data.recommendations);
  },

  async getHistory(): Promise<Recommendations[]> {
    const { data } = await api.get('/recommendations/history');
    return (data.recommendations || []).map(toRec);
  },
};
