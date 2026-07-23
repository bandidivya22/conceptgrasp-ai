import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Trophy,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { quizService } from '../services/quizService';
import { Card, Button, Spinner, EmptyState, useToast, Badge } from '../components/ui';
import { cn } from '../utils/format';

export default function QuizTake() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [attemptResult, setAttemptResult] = useState<any>(null);

  const { data: quizData, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => {
      if (!id) throw new Error('Quiz ID required');
      const q = await quizService.getById(id);
      if (!q) throw new Error('Quiz not found');
      return q;
    },
    enabled: !!id,
  });

  const quiz = quizData;
  const totalQuestions = quiz?.questions.length || 0;

  useEffect(() => {
    if (quiz) {
      setTimeLeft(totalQuestions * 60);
      setAnswers(new Array(totalQuestions).fill(''));
    }
  }, [quiz, totalQuestions]);

  useEffect(() => {
    if (timeLeft <= 0 || showResults) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, showResults]);

  const submitMutation = useMutation({
    mutationFn: quizService.submit,
    onSuccess: (res) => {
      setAttemptResult(res);
      setShowResults(true);
      toast('Quiz submitted!', 'success');
    },
    onError: (err: Error) => toast(err.message, 'error'),
  });

  useEffect(() => {
    if (timeLeft === 0 && quiz && !showResults && answers.length) {
      handleSubmit();
    }
  }, [timeLeft]);

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size={32} /></div>;
  }

  if (!quiz) {
    return <EmptyState icon={<AlertCircle className="h-8 w-8" />} title="Quiz not found" action={<Button onClick={() => navigate('/quizzes')}>Back to Quizzes</Button>} />;
  }

  const handleSubmit = () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    submitMutation.mutate({ quizId: quiz.id, answers, timeTaken });
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (showResults && attemptResult) {
    const correctCount = attemptResult.answers.filter((a: any) => a.isCorrect).length;
    const passed = attemptResult.percentage >= 70;
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="text-center p-8">
            <div className={cn('inline-flex h-20 w-20 items-center justify-center rounded-full mb-4', passed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30')}>
              <Trophy className={cn('h-10 w-10', passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{passed ? 'Great job!' : 'Keep practicing!'}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">You scored {correctCount} out of {attemptResult.total_questions}</p>
            <div className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 text-white">
              <span className="text-3xl font-bold">{attemptResult.percentage}%</span>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatTime(attemptResult.time_taken)}</span>
            </div>
            <div className="flex gap-3 justify-center mt-6">
              <Button variant="secondary" onClick={() => navigate('/quizzes')}>Back to Quizzes</Button>
              <Button onClick={() => window.location.reload()}><RotateCcw className="h-4 w-4" /> Retake</Button>
            </div>
          </Card>
        </motion.div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Review Answers</h3>
          {attemptResult.answers.map((a: any, i: number) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-3">
                {a.isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{a.question}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className={cn(a.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                      Your answer: {a.userAnswer || '(no answer)'}
                    </p>
                    {!a.isCorrect && (
                      <p className="text-emerald-600 dark:text-emerald-400">
                        Correct answer: {a.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQ];
  const progress = ((currentQ + 1) / totalQuestions) * 100;
  const isLast = currentQ === totalQuestions - 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/quizzes')}>
          <ArrowLeft className="h-4 w-4" /> Exit
        </Button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Question {currentQ + 1} of {totalQuestions}</span>
          <Badge color="primary">{quiz.subject}</Badge>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge color="slate">{question.type === 'mcq' ? 'Multiple Choice' : question.type === 'truefalse' ? 'True / False' : 'Short Answer'}</Badge>
              <Badge color={question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'error'}>
                {question.difficulty}
              </Badge>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{question.question}</h2>

            <div className="space-y-2">
              {question.type === 'short' ? (
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Type your answer..."
                  value={answers[currentQ] || ''}
                  onChange={(e) => {
                    const next = [...answers];
                    next[currentQ] = e.target.value;
                    setAnswers(next);
                  }}
                />
              ) : (
                question.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const next = [...answers];
                      next[currentQ] = opt;
                      setAnswers(next);
                    }}
                    className={cn(
                      'w-full text-left p-3 rounded-xl border-2 transition-all',
                      answers[currentQ] === opt
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <span className="font-medium">{opt}</span>
                  </button>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          disabled={currentQ === 0}
          onClick={() => setCurrentQ((q) => q - 1)}
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </Button>
        {isLast ? (
          <Button
            onClick={handleSubmit}
            loading={submitMutation.isPending}
            disabled={!answers.filter(Boolean).length}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQ((q) => q + 1)}
            disabled={!answers[currentQ]}
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
