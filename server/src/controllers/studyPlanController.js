import StudyPlan from '../models/StudyPlan.js';
import { generateStudyPlan, isGeminiConfigured } from '../services/geminiService.js';

const samplePlan = ({ subjects, availableHours, weakTopics }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Date();
  const dailyPlan = days.map((day, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      day,
      date: date.toISOString().split('T')[0],
      topics: subjects.slice(0, 2),
      hours: availableHours,
      activities: ['Review notes', 'Practice problems', 'Take short quiz'],
      isRevision: false,
    };
  });

  const weeklyPlan = [1, 2, 3, 4].map((week) => ({
    day: `Week ${week}`,
    topics: subjects,
    hours: availableHours * 7,
    activities: [`Focus on ${weakTopics[0] || subjects[0] || 'core topics'}`, 'Complete assignments', 'Review week'],
  }));

  const revisionSchedule = days.map((day, i) => ({
    day: `Day ${i + 1}`,
    topics: subjects.slice(0, 1),
    hours: Math.round(availableHours / 2),
    activities: ['Review flashcards', 'Practice quiz', 'Summarize notes'],
    isRevision: true,
  }));

  return { dailyPlan, weeklyPlan, revisionSchedule };
};

export const generateStudyPlanController = async (req, res) => {
  const { subjects, availableHours = 4, examDate = '', weakTopics = [] } = req.body;

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    res.status(400);
    throw new Error('At least one subject is required');
  }

  let plan;
  if (isGeminiConfigured()) {
    try {
      plan = await generateStudyPlan({ subjects, availableHours, examDate, weakTopics });
    } catch (error) {
      plan = samplePlan({ subjects, availableHours, weakTopics });
    }
  } else {
    plan = samplePlan({ subjects, availableHours, weakTopics });
  }

  const studyPlan = await StudyPlan.create({
    user: req.user._id,
    title: `Study Plan - ${subjects.join(', ')}`,
    subjects,
    availableHoursPerDay: availableHours,
    examDate,
    weakTopics,
    dailyPlan: plan.dailyPlan,
    weeklyPlan: plan.weeklyPlan,
    revisionSchedule: plan.revisionSchedule,
  });

  res.status(201).json({ success: true, studyPlan });
};

export const getStudyPlans = async (req, res) => {
  const plans = await StudyPlan.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
  res.json({ success: true, plans });
};

export const getStudyPlan = async (req, res) => {
  const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id });
  if (!plan) {
    res.status(404);
    throw new Error('Study plan not found');
  }
  res.json({ success: true, plan });
};
