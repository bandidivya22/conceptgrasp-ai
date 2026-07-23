import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  RefreshCw,
  Target,
  AlertTriangle,
  HelpCircle,
  CheckSquare,
  Lightbulb,
  Bot,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { recommendationService } from '../services/recommendationService';
import { Card, CardHeader, Button, EmptyState, Spinner, useToast } from '../components/ui';
import { timeAgo } from '../utils/format';

export default function Recommendations() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['recommendations'],
    queryFn: recommendationService.get,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    toast('Refreshing recommendations...', 'info');
  };

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size={32} /></div>;
  }
  if (error || !data) {
    return <EmptyState icon={<Sparkles className="h-8 w-8" />} title="Unable to load recommendations" description={error?.message} />;
  }

  const r = data;

  const sections = [
    { title: 'Topics to Revise', items: r.topics_to_revise, icon: Target, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Weak Subjects', items: r.weak_subjects, icon: AlertTriangle, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { title: 'Practice Questions', items: r.practice_questions, icon: HelpCircle, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Daily Goals', items: r.daily_goals, icon: CheckSquare, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Recommendations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personalized insights based on your learning data
            {r.created_at && <span className="ml-2 text-xs">· Updated {timeAgo(r.created_at)}</span>}
          </p>
        </div>
        <Button variant="secondary" onClick={handleRefresh} loading={isFetching}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {r.learning_strategy && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-r from-primary-600 to-accent-600 border-0 text-white">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shrink-0">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Learning Strategy</h3>
                <p className="text-sm text-white/90 leading-relaxed">{r.learning_strategy}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="h-full">
              <CardHeader title={s.title} icon={<s.icon className="h-5 w-5" />} />
              {s.items.length ? (
                <div className={`rounded-xl ${s.bg} p-4 space-y-2`}>
                  {s.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${s.color} text-white text-xs font-bold shrink-0 mt-0.5`}>
                        {j + 1}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<s.icon className="h-8 w-8" />} title="No recommendations yet" />
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {r.insights.length > 0 && (
        <Card>
          <CardHeader title="Insights" subtitle="Quick observations about your progress" icon={<Bot className="h-5 w-5" />} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {r.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <Sparkles className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-slate-200">{insight}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
