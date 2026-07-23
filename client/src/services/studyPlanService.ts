import { api } from './api';
import type { StudyPlan } from '../types';

export interface GenerateStudyPlanPayload {
  subjects: string[];
  availableHours: number;
  examDate?: string;
  weakTopics?: string[];
}

const toPlan = (d: any): StudyPlan => ({
  id: d._id || d.id,
  title: d.title,
  subjects: d.subjects || [],
  available_hours_per_day: d.availableHoursPerDay ?? d.available_hours_per_day ?? 4,
  exam_date: d.examDate || d.exam_date || '',
  weak_topics: d.weakTopics || d.weak_topics || [],
  daily_plan: d.dailyPlan || d.daily_plan || [],
  weekly_plan: d.weeklyPlan || d.weekly_plan || [],
  revision_schedule: d.revisionSchedule || d.revision_schedule || [],
  created_at: d.createdAt || d.created_at || '',
});

export const studyPlanService = {
  async generate(payload: GenerateStudyPlanPayload): Promise<StudyPlan> {
    const { data } = await api.post('/studyplan/generate', {
      subjects: payload.subjects,
      availableHours: payload.availableHours,
      examDate: payload.examDate || '',
      weakTopics: payload.weakTopics || [],
    });
    return toPlan(data.studyPlan);
  },

  async getAll(): Promise<StudyPlan[]> {
    const { data } = await api.get('/studyplan');
    return (data.plans || []).map(toPlan);
  },

  async getById(id: string): Promise<StudyPlan> {
    const { data } = await api.get(`/studyplan/${id}`);
    return toPlan(data.plan);
  },
};
