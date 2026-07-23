import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Sparkles,
  Trophy,
  Play,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { quizService } from '../services/quizService';
import { documentService } from "../services/documentService";
import { Card, Button, Input, Select, EmptyState, Modal, Badge, useToast, Spinner } from '../components/ui';
import { formatDate } from '../utils/format';

export default function Quizzes() {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [genForm, setGenForm] = useState({ documentId: '', subject: 'General', count: 5 });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: quizzesData, isLoading: quizzesLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: quizService.getAll,
  });

  const { data: historyData } = useQuery({
    queryKey: ['quizHistory'],
    queryFn: quizService.getHistory,
  });

  // Fetch documents for the selection dropdown
  const { data: documentsData } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getAll(),
  });

  const documents = documentsData?.documents || [];

  const generateMutation = useMutation({
    mutationFn: quizService.generate,
    onSuccess: (res) => {
      toast('Quiz generated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      setGenerateOpen(false);
      setGenForm({ documentId: '', subject: 'General', count: 5 });
      navigate(`/quizzes/${res.id || res._id}`);
    },
    onError: (err: Error) => toast(err.message, 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quizzes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Test your knowledge with AI-generated quizzes</p>
        </div>
        <Button onClick={() => setGenerateOpen(true)}>
          <Sparkles className="h-4 w-4" /> Generate Quiz
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Available Quizzes</h2>
          {quizzesLoading ? (
            <div className="flex justify-center py-12"><Spinner size={32} /></div>
          ) : quizzesData?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quizzesData.map((quiz, i) => (
                <motion.div key={quiz.id || quiz._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card hover className="flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 shrink-0">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">{quiz.title}</h3>
                        <p className="text-xs text-slate-500">{formatDate(quiz.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge color="primary">{quiz.subject}</Badge>
                      <Badge color="slate">{quiz.questions?.length || 0} questions</Badge>
                    </div>
                    <Button className="mt-auto w-full" onClick={() => navigate(`/quizzes/${quiz.id || quiz._id}`)}>
                      <Play className="h-4 w-4" /> Start Quiz
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<HelpCircle className="h-8 w-8" />}
              title="No quizzes yet"
              description="Generate your first AI-powered quiz"
              action={<Button onClick={() => setGenerateOpen(true)}><Sparkles className="h-4 w-4" /> Generate Quiz</Button>}
            />
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Attempts</h2>
          {historyData?.length ? (
            <div className="space-y-3">
              {historyData.slice(0, 8).map((attempt) => {
                const quiz = attempt.quiz;
                return (
                  <Card key={attempt.id || attempt._id} className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {quiz?.title || 'Quiz'}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(attempt.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${attempt.percentage >= 70 ? 'text-emerald-500' : attempt.percentage >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                          {attempt.percentage}%
                        </span>
                        {attempt.percentage >= 70 ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <EmptyState icon={<Trophy className="h-8 w-8" />} title="No attempts yet" description="Take a quiz to see your history" />
            </Card>
          )}
        </div>
      </div>

      <Modal open={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate Quiz with AI" size="md">
        <div className="space-y-4">
          <Select
            label="Select Document"
            value={genForm.documentId}
            onChange={(e) => {
              const selectedId = e.target.value;
              const doc = documents.find((d: any) => (d._id || d.id) === selectedId);

              setGenForm({
                ...genForm,
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

          <div className="grid grid-cols-2 gap-3">
            <Input 
              label="Subject" 
              value={genForm.subject} 
              onChange={(e) => setGenForm({ ...genForm, subject: e.target.value })} 
            />
            <Select 
              label="Number of Questions" 
              value={genForm.count} 
              onChange={(e) => setGenForm({ ...genForm, count: Number(e.target.value) })}
            >
              {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n} questions</option>)}
            </Select>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
            <Sparkles className="h-4 w-4 text-primary-500 shrink-0" />
            <span>Powered by Google Gemini. Selecting a document will automatically parse its contents.</span>
          </div>

          <Button
            className="w-full"
            loading={generateMutation.isPending}
            disabled={!genForm.documentId}
            onClick={() => generateMutation.mutate(genForm)}
          >
            <Sparkles className="h-4 w-4" /> Generate Quiz
          </Button>
        </div>
      </Modal>
    </div>
  );
}