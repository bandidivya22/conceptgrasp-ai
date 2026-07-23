import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Sparkles,
  Search,
  Shuffle,
  Bookmark,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { flashcardService } from '../services/flashcardService';
import { documentService } from '../services/documentService';
import type { Flashcard as FlashcardType } from '../types';
import { Button, Input, Select, EmptyState, Modal, Badge, useToast, Spinner, ConfirmDialog } from '../components/ui';
import { cn } from '../utils/format';

const difficultyColors = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
} as const;

export default function Flashcards() {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  // State structure supporting both Document selection and Subject defaults
  const [genForm, setGenForm] = useState({
    documentId: '',
    subject: 'General',
    count: 10,
  });

  const queryClient = useQueryClient();
  const toast = useToast();

  // Fetch flashcards
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['flashcards', subject, difficulty, search, bookmarkedOnly],
    queryFn: () => flashcardService.getAll({ subject, difficulty, search, bookmarked: bookmarkedOnly }),
  });

  // Safe fallback to extract array cleanly
  const data: FlashcardType[] = Array.isArray(rawData)
    ? rawData
    : (rawData as any)?.flashcards || [];

  // Fetch user documents for the document selection dropdown
  const { data: documentsData } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getAll(),
  });

  const documents = documentsData?.documents || documentsData || [];

  const generateMutation = useMutation({
    mutationFn: flashcardService.generate,
    onSuccess: (res: any) => {
      const generatedCount = res?.length || res?.flashcards?.length || genForm.count;
      toast(`${generatedCount} flashcards generated!`, 'success');
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      setGenerateOpen(false);
      setGenForm({ documentId: '', subject: 'General', count: 10 });
    },
    onError: (err: Error) => toast(err.message || 'Generation failed', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FlashcardType> }) =>
      flashcardService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flashcards'] }),
    onError: (err: Error) => toast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: flashcardService.delete,
    onSuccess: () => {
      toast('Flashcard deleted', 'success');
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      setDeleteId(null);
    },
    onError: (err: Error) => toast(err.message, 'error'),
  });

  const toggleFlip = (id: string) => setFlipped((f) => ({ ...f, [id]: !f[id] }));

  const shuffle = () => {
    if (!data?.length) return;
    setFlipped({});
    queryClient.setQueryData(
      ['flashcards', subject, difficulty, search, bookmarkedOnly],
      [...data].sort(() => Math.random() - 0.5)
    );
    toast('Flashcards shuffled', 'info');
  };

  const subjects = ['All', 'General', 'Mathematics', 'Science', 'History', 'Computer Science', 'Literature'];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Flashcards</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate and study with AI-powered flashcards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={shuffle} disabled={!data?.length}>
            <Shuffle className="h-4 w-4" /> Shuffle
          </Button>
          <Button onClick={() => setGenerateOpen(true)}>
            <Sparkles className="h-4 w-4" /> Generate
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search flashcards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field sm:w-44 cursor-pointer">
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field sm:w-36 cursor-pointer">
          <option value="All">All Levels</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <Button
          variant={bookmarkedOnly ? 'primary' : 'secondary'}
          onClick={() => setBookmarkedOnly((b) => !b)}
        >
          <Bookmark className="h-4 w-4" /> Saved
        </Button>
      </div>

      {/* Flashcard Display List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : data?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((card) => {
            const cardId = card.id || (card as any)._id;
            return (
              <motion.div key={cardId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} layout>
                <div
                  className="relative h-56 cursor-pointer"
                  onClick={() => toggleFlip(cardId)}
                  style={{ perspective: '1000px' }}
                >
                  <motion.div
                    animate={{ rotateY: flipped[cardId] ? 180 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front side */}
                    <div className="absolute inset-0 card p-5 flex flex-col" style={{ backfaceVisibility: 'hidden' }}>
                      <div className="flex items-center justify-between mb-3">
                        <Badge color={difficultyColors[card.difficulty] || 'warning'}>{card.difficulty}</Badge>
                        <Badge color="primary">{card.subject}</Badge>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-center font-medium text-slate-900 dark:text-white">{card.question}</p>
                      </div>
                      <p className="text-xs text-slate-400 text-center">Click to flip</p>
                    </div>

                    {/* Back side */}
                    <div
                      className="absolute inset-0 card p-5 flex flex-col bg-primary-50 dark:bg-primary-900/20"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge color="success">Answer</Badge>
                        <Badge color="primary">{card.subject}</Badge>
                      </div>
                      <div className="flex-1 flex items-center justify-center overflow-auto">
                        <p className="text-center text-sm text-slate-700 dark:text-slate-200">{card.answer}</p>
                      </div>
                      <p className="text-xs text-slate-400 text-center">Click to flip back</p>
                    </div>
                  </motion.div>
                </div>

                {/* Card action items */}
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateMutation.mutate({ id: cardId, payload: { bookmarked: !card.bookmarked } })}
                    className={cn(card.bookmarked && 'text-amber-500')}
                  >
                    <Bookmark className={cn('h-4 w-4', card.bookmarked && 'fill-current')} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateMutation.mutate({ id: cardId, payload: { learned: !card.learned } })}
                    className={cn(card.learned && 'text-emerald-500')}
                  >
                    <CheckCircle2 className={cn('h-4 w-4', card.learned && 'fill-current')} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setDeleteId(cardId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Layers className="h-8 w-8" />}
          title="No flashcards yet"
          description="Generate your first set of flashcards with AI"
          action={<Button onClick={() => setGenerateOpen(true)}><Sparkles className="h-4 w-4" /> Generate Flashcards</Button>}
        />
      )}

      {/* GENERATE MODAL WITH CHOOSE DOCUMENT DROPDOWN */}
      <Modal open={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate Flashcards with AI" size="md">
        <div className="space-y-4">
          <Select
            label="Select Document (Optional)"
            value={genForm.documentId}
            onChange={(e) => {
              const selectedId = e.target.value;
              const doc = Array.isArray(documents)
                ? documents.find((d: any) => (d._id || d.id) === selectedId)
                : null;

              setGenForm({
                ...genForm,
                documentId: selectedId,
                subject: doc?.subject || genForm.subject || 'General',
              });
            }}
          >
            <option value="">Choose Document (or generate by subject)</option>
            {Array.isArray(documents) && documents.map((doc: any) => (
              <option key={doc._id || doc.id} value={doc._id || doc.id}>
                {doc.title || doc.name || "Untitled Document"}
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
              label="Number of Cards"
              value={genForm.count}
              onChange={(e) => setGenForm({ ...genForm, count: Number(e.target.value) })}
            >
              {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n} cards</option>)}
            </Select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
            <Sparkles className="h-4 w-4 text-primary-500 shrink-0" />
            <span>Powered by Google Gemini. Selecting a document parses its content automatically!</span>
          </div>

          <Button
            className="w-full"
            loading={generateMutation.isPending}
            onClick={() => generateMutation.mutate(genForm)}
          >
            <Sparkles className="h-4 w-4" /> Generate Flashcards
          </Button>
        </div>
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Flashcard"
        message="Are you sure you want to delete this flashcard?"
        confirmText="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}