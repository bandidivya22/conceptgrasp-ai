import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Sparkles,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  Plus,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { studyPlanService } from '../services/studyPlanService';
import { documentService } from "../services/documentService";
import type { StudyPlan as StudyPlanType, DayPlan } from '../types';
import { Card, Button, Input, Select, EmptyState, useToast, Spinner, Badge } from '../components/ui';

export default function StudyPlanner() {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [form, setForm] = useState({
    documentId: '',
    subject: 'General',
    availableHours: 4,
    examDate: '',
    weakTopics: [''],
  });
  const [selectedPlan, setSelectedPlan] = useState<StudyPlanType | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['studyPlans'],
    queryFn: studyPlanService.getAll,
  });

  // Fetch uploaded documents for user selection
  const { data: documentsData } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getAll(),
  });

  const documents = documentsData?.documents || [];

  const generateMutation = useMutation({
    mutationFn: studyPlanService.generate,
    onSuccess: (res) => {
      toast('Study plan generated!', 'success');
      queryClient.invalidateQueries({ queryKey: ['studyPlans'] });
      setGenerateOpen(false);
      setSelectedPlan(res);
      setForm({ documentId: '', subject: 'General', availableHours: 4, examDate: '', weakTopics: [''] });
    },
    onError: (err: Error) => toast(err.message, 'error'),
  });

  const handleSubmit = () => {
    if (!form.documentId) {
      toast('Please select a document', 'error');
      return;
    }
    const weakTopics = form.weakTopics.filter((t) => t.trim());
    
    // Construct a safe, comprehensive payload that accommodates array or string matching 
    // along with both snake_case and camelCase parameters to satisfy the server signature.
    const payload = {
      // 1. Keep standard properties
      documentId: form.documentId,
      document_id: form.documentId,
      
      // 2. Handle Subject naming compatibility (single string vs array string mapping)
      subject: form.subject,
      subjects: [form.subject], 
      
      // 3. Handle hours layout variations
      availableHours: form.availableHours,
      available_hours: form.availableHours,
      available_hours_per_day: form.availableHours,
      
      // 4. Handle date formatting configurations
      examDate: form.examDate,
      exam_date: form.examDate,
      
      // 5. Weak subjects listing array
      weakTopics,
      weak_topics: weakTopics
    };

    generateMutation.mutate(payload);
  };

  const updateField = (field: 'weakTopics', i: number, value: string) => {
    setForm((f) => {
      const next = [...f[field]];
      next[i] = value;
      return { ...f, [field]: next };
    });
  };
  const addField = (field: 'weakTopics') => setForm((f) => ({ ...f, [field]: [...f[field], ''] }));
  const removeField = (field: 'weakTopics', i: number) => setForm((f) => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));

  const renderDayPlan = (day: DayPlan, i: number) => (
    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {day.isRevision && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            <h4 className="font-semibold text-slate-900 dark:text-white">{day.day}</h4>
            {day.date && <Badge color="slate">{day.date}</Badge>}
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            {day.hours}h
          </div>
        </div>
        {day.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {day.topics.map((t, j) => <Badge key={j} color="primary">{t}</Badge>)}
          </div>
        )}
        {day.activities.length > 0 && (
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            {day.activities.map((a, j) => (
              <li key={j} className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                {a}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Study Planner</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create AI-powered personalized study plans</p>
        </div>
        <Button onClick={() => setGenerateOpen(true)}>
          <Sparkles className="h-4 w-4" /> Generate Plan
        </Button>
      </div>

      {selectedPlan ? (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedPlan.title}</h2>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedPlan.subjects?.map((s, i) => <Badge key={i} color="primary">{s}</Badge>)}
                  <Badge color="slate">{selectedPlan.available_hours_per_day}h/day</Badge>
                  {selectedPlan.exam_date && <Badge color="warning">Exam: {selectedPlan.exam_date}</Badge>}
                </div>
              </div>
              <Button variant="secondary" onClick={() => setSelectedPlan(null)}>Back to Plans</Button>
            </div>
          </Card>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary-500" /> Daily Plan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedPlan.daily_plan?.map(renderDayPlan)}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" /> Weekly Plan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedPlan.weekly_plan?.map(renderDayPlan)}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-500" /> Revision Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedPlan.revision_schedule?.map(renderDayPlan)}
            </div>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : data?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((plan, i) => (
            <motion.div key={plan.id || plan._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card hover className="cursor-pointer h-full" onClick={() => setSelectedPlan(plan)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 shrink-0">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{plan.title}</h3>
                    <p className="text-xs text-slate-500">{plan.daily_plan?.length || 0} days planned</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {plan.subjects?.slice(0, 3).map((s, j) => <Badge key={j} color="primary">{s}</Badge>)}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {plan.available_hours_per_day}h/day</span>
                  {plan.exam_date && <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {plan.exam_date}</span>}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarDays className="h-8 w-8" />}
          title="No study plans yet"
          description="Generate a personalized AI study plan to organize your learning"
          action={<Button onClick={() => setGenerateOpen(true)}><Sparkles className="h-4 w-4" /> Generate Plan</Button>}
        />
      )}

      {generateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setGenerateOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Generate Study Plan</h2>
              <button onClick={() => setGenerateOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <Select
                label="Select Document"
                value={form.documentId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const doc = documents.find((d: any) => (d._id || d.id) === selectedId);

                  setForm({
                    ...form,
                    documentId: selectedId,
                    subject: doc?.subject || "General",
                  });
                }}
              >
                <option value="">Choose Document</option>
                {documents.map((doc: any) => (
                  <option key={doc._id || doc.id} value={doc._id || doc.id}>
                    {doc.title}
                  </option>
                ))}
              </Select>

              <Input 
                label="Subject" 
                value={form.subject} 
                onChange={(e) => setForm({ ...form, subject: e.target.value })} 
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Available Hours/Day"
                  type="number"
                  min={1}
                  max={16}
                  value={form.availableHours}
                  onChange={(e) => setForm({ ...form, availableHours: Number(e.target.value) })}
                />
                <Input
                  label="Exam Date"
                  type="date"
                  value={form.examDate}
                  onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                />
              </div>

              <div>
                <label className="label-field block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weak Topics (optional)</label>
                <div className="space-y-2">
                  {form.weakTopics.map((t, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={t}
                        onChange={(e) => updateField('weakTopics', i, e.target.value)}
                        placeholder={`Weak topic ${i + 1}`}
                      />
                      {form.weakTopics.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeField('weakTopics', i)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => addField('weakTopics')}>
                  <Plus className="h-4 w-4" /> Add Topic
                </Button>
              </div>

              <Button 
                className="w-full" 
                loading={generateMutation.isPending} 
                disabled={!form.documentId} 
                onClick={handleSubmit}
              >
                <Sparkles className="h-4 w-4" /> Generate Study Plan
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}