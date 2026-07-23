import mongoose from 'mongoose';

const dayPlanSchema = new mongoose.Schema({
  day: { type: String, required: true },
  date: { type: String },
  topics: [{ type: String }],
  hours: { type: Number, default: 0 },
  activities: [{ type: String }],
  isRevision: { type: Boolean, default: false },
});

const studyPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    subjects: [{ type: String }],
    availableHoursPerDay: { type: Number, default: 4 },
    examDate: { type: String, default: '' },
    weakTopics: [{ type: String }],
    dailyPlan: [dayPlanSchema],
    weeklyPlan: [dayPlanSchema],
    revisionSchedule: [dayPlanSchema],
  },
  { timestamps: true }
);

export default mongoose.model('StudyPlan', studyPlanSchema);
