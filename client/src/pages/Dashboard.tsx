import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText,
  Layers,
  HelpCircle,
  Clock,
  Flame,
  Sparkles,
  Upload,
  MessageSquare,
  CalendarDays,
  TrendingUp,
  Trophy,
  CheckCircle,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { dashboardService } from '../services/dashboardService';
import { Card, CardHeader, Spinner, EmptyState } from '../components/ui';
import StudyHoursChart from '../components/charts/StudyHoursChart';
import QuizPerformanceChart from '../components/charts/QuizPerformanceChart';
import SubjectProgressChart from '../components/charts/SubjectProgressChart';

const iconMap: Record<string, typeof FileText> = {
  FileText,
  Layers,
  HelpCircle,
  Trophy,
  CheckCircle,
};

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.get,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size={36} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        icon={<Bot className="h-8 w-8" />}
        title="Unable to load dashboard"
        description={error?.message || 'Please try again later'}
      />
    );
  }

  const { stats, charts, recentActivities } = data;

  const cards = [
    { label: 'Documents',      value: stats.documents,           icon: FileText,   glow: 'icon-glow-blue' },
    { label: 'Flashcards',      value: stats.flashcards,          icon: Layers,     glow: 'icon-glow-green' },
    { label: 'Quizzes',         value: stats.quizzes,             icon: HelpCircle, glow: 'icon-glow-purple' },
    { label: 'Study Hours',     value: stats.studyHours,          icon: Clock,      glow: 'icon-glow-amber' },
    { label: 'Learning Streak', value: `${stats.streak} days`,     icon: Flame,      glow: 'icon-glow-orange' },
    { label: 'Avg Quiz Score',  value: `${stats.avgScore}%`,      icon: Trophy,     glow: 'icon-glow-cyan' },
  ];

  const quickActions = [
    { label: 'Upload Notes',        icon: Upload,        to: '/documents',       color: 'from-blue-500 to-blue-600' },
    { label: 'Generate Flashcards', icon: Layers,        to: '/flashcards',      color: 'from-emerald-500 to-emerald-600' },
    { label: 'Generate Quiz',       icon: HelpCircle,     to: '/quizzes',         color: 'from-violet-500 to-purple-600' },
    { label: 'AI Tutor',             icon: MessageSquare, to: '/chat',            color: 'from-cyan-500 to-blue-500' },
    { label: 'Study Planner',        icon: CalendarDays,  to: '/planner',         color: 'from-amber-500 to-orange-500' },
    { label: 'AI Recommendations',  icon: Sparkles,      to: '/recommendations', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="space-y-6 relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your learning journey at a glance
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Card hover className="p-4 h-full">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${c.glow} mb-3`}>
                <c.icon className="h-5 w-5 text-blue-400 dark:text-blue-300" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{c.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly Study Hours + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Weekly Study Hours" subtitle="Your study activity this week" icon={<Clock className="h-5 w-5" />} />
          {charts.weeklyHours.length ? (
            <StudyHoursChart data={charts.weeklyHours} />
          ) : (
            <EmptyState icon={<Clock className="h-8 w-8" />} title="No study data yet" description="Start a study session to see your progress" />
          )}
        </Card>

        <Card>
          <CardHeader title="Recent Activities" icon={<TrendingUp className="h-5 w-5" />} />
          {recentActivities.length ? (
            <div className="space-y-2">
              {recentActivities.map((a, i) => {
                const Icon = iconMap[a.icon] || CheckCircle;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl icon-glow-blue shrink-0">
                      <Icon className="h-4 w-4 text-blue-400 dark:text-blue-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">{a.text}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<TrendingUp className="h-8 w-8" />} title="No recent activity" />
          )}
        </Card>
      </div>

      {/* Quiz Performance + Subject Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Quiz Performance" subtitle="Your recent quiz scores" icon={<Trophy className="h-5 w-5" />} />
          {charts.quizPerformance.length ? (
            <QuizPerformanceChart data={charts.quizPerformance} />
          ) : (
            <EmptyState icon={<Trophy className="h-8 w-8" />} title="No quizzes yet" description="Take a quiz to see your performance" />
          )}
        </Card>

        <Card>
          <CardHeader title="Subject Progress" subtitle="Hours spent per subject" icon={<Layers className="h-5 w-5" />} />
          {charts.subjectProgress.length ? (
            <SubjectProgressChart data={charts.subjectProgress} />
          ) : (
            <EmptyState icon={<Layers className="h-8 w-8" />} title="No subject data" />
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" subtitle="Jump into your favorite tools" icon={<Sparkles className="h-5 w-5" />} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((a) => (
            <Link key={a.label} to={a.to}>
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-blue-500/10 hover:dark:border-blue-500/30 hover:dark:shadow-neon-xs transition-all"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${a.color} text-white shadow-lg`}>
                  <a.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200 text-center">{a.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </Card>

      {/* AI Recommendations banner */}
      <Card className="bg-gradient-to-r from-blue-600/90 to-cyan-500/90 dark:from-blue-600 dark:to-cyan-500 border-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Get personalized AI recommendations</h3>
              <p className="text-sm text-white/80">Let our AI analyze your progress and suggest next steps</p>
            </div>
          </div>
          <Link to="/recommendations">
            <button className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-lg hover:bg-white/90 transition-colors">
              View Insights <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
