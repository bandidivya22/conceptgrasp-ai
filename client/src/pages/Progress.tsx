import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Clock,
  Flame,
  Trophy,
  Layers,
  FileText,
  Star,
  Bot,
  Crown,
  Award,
  Target,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { progressService } from '../services/dashboardService';
import { Card, CardHeader, EmptyState, Spinner, Badge } from '../components/ui';
import { useTheme } from '../context/ThemeContext';

const achievementIcons: Record<string, typeof Star> = {
  Flame, Trophy, Crown, FileText, Layers, HelpCircle, Star, Bot, Award, Target, Zap,
};

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Progress() {
  const { theme } = useTheme();
  const { data, isLoading, error } = useQuery({
    queryKey: ['progress'],
    queryFn: progressService.get,
  });

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size={32} /></div>;
  }
  if (error || !data) {
    return <EmptyState icon={<TrendingUp className="h-8 w-8" />} title="Unable to load progress" description={error?.message} />;
  }

  const { stats, charts, achievements } = data;
  const grid = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  const statCards = [
    { label: 'Study Hours', value: stats.studyHours, icon: Clock, color: 'from-amber-500 to-orange-500' },
    { label: 'Day Streak', value: stats.streak, icon: Flame, color: 'from-red-500 to-pink-500' },
    { label: 'Quizzes Taken', value: stats.totalQuizzes, icon: Trophy, color: 'from-purple-500 to-indigo-500' },
    { label: 'Avg Score', value: `${stats.avgScore}%`, icon: Target, color: 'from-emerald-500 to-teal-500' },
    { label: 'Best Score', value: `${stats.bestScore}%`, icon: Star, color: 'from-cyan-500 to-blue-500' },
    { label: 'Flashcards', value: stats.totalFlashcards, icon: Layers, color: 'from-blue-500 to-violet-500' },
    { label: 'Learned', value: stats.learnedFlashcards, icon: Bot, color: 'from-emerald-500 to-green-500' },
    { label: 'Documents', value: stats.totalDocuments, icon: FileText, color: 'from-slate-500 to-slate-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Progress Tracker</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor your learning journey and achievements</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white mb-3`}>
                <c.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{c.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Study Hours (Last 30 Days)" subtitle="Your daily study activity" icon={<Clock className="h-5 w-5" />} />
          {charts.studyHours30Days.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={charts.studyHours30Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="date" stroke={tickColor} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke={tickColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: theme === 'dark' ? '#1e293b' : '#fff', border: `1px solid ${grid}`, borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={<Clock className="h-8 w-8" />} title="No study data yet" />
          )}
        </Card>

        <Card>
          <CardHeader title="Flashcard Difficulty" subtitle="Distribution by level" icon={<Layers className="h-5 w-5" />} />
          {charts.difficultyDistribution.some((d) => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={charts.difficultyDistribution}
                  dataKey="count"
                  nameKey="difficulty"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {charts.difficultyDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: theme === 'dark' ? '#1e293b' : '#fff', border: `1px solid ${grid}`, borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={<Layers className="h-8 w-8" />} title="No flashcards yet" />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Subject Progress" subtitle="Hours per subject" icon={<TrendingUp className="h-5 w-5" />} />
          {charts.subjectProgress.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={charts.subjectProgress} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubject" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
                <XAxis type="number" stroke={tickColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="subject" stroke={tickColor} fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip contentStyle={{ background: theme === 'dark' ? '#1e293b' : '#fff', border: `1px solid ${grid}`, borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="hours" stroke="#06b6d4" strokeWidth={2} fill="url(#colorSubject)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={<TrendingUp className="h-8 w-8" />} title="No subject data" />
          )}
        </Card>

        <Card>
          <CardHeader title="Quiz Score Trend" subtitle="Your recent quiz scores" icon={<Trophy className="h-5 w-5" />} />
          {charts.quizScores.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={charts.quizScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="attempt" stroke={tickColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={tickColor} fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: theme === 'dark' ? '#1e293b' : '#fff', border: `1px solid ${grid}`, borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={<Trophy className="h-8 w-8" />} title="No quiz data yet" />
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Achievements" subtitle={`${achievements.length} unlocked`} icon={<Award className="h-5 w-5" />} />
        {achievements.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((a, i) => {
              const Icon = achievementIcons[a.icon] || Award;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/30"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{a.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{a.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={<Award className="h-8 w-8" />} title="No achievements yet" description="Keep learning to unlock achievements!" />
        )}
      </Card>
    </div>
  );
}
