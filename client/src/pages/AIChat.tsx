import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Send,
  Bot,
  Trash2,
  Plus,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '../services/chatService';
import type { ChatMessage } from '../types';
import { Card, Button, EmptyState, useToast, ConfirmDialog, Spinner } from '../components/ui';
import { cn, timeAgo } from '../utils/format';

const SUGGESTED_QUESTIONS = [
  'Explain photosynthesis in simple terms',
  'What are the key concepts of calculus?',
  'How do I prepare for my upcoming exam?',
  'Summarize Newton\'s laws of motion',
  'Tips for improving memory retention',
  'Explain the difference between mitosis and meiosis',
];

export default function AIChat() {
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: historyData } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: chatService.getHistory,
  });

  const sendMutation = useMutation({
    mutationFn: chatService.send,
    onMutate: async (vars) => {
      setTyping(true);
      setMessages((m) => [...m, { role: 'user', content: vars.message }]);
      setInput('');
    },
    onSuccess: (res) => {
      setTyping(false);
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }]);
      setConversationId(res.conversationId);
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
    },
    onError: (err: Error) => {
      setTyping(false);
      setMessages((m) => m.slice(0, -1));
      toast(err.message, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: chatService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
      setDeleteId(null);
      if (conversationId === deleteId) {
        setConversationId(null);
        setMessages([]);
      }
      toast('Conversation deleted', 'success');
    },
    onError: (err: Error) => toast(err.message, 'error'),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = (text?: string) => {
    const message = (text || input).trim();
    if (!message || typing) return;
    sendMutation.mutate({ message, conversationId: conversationId || undefined });
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const loadConversation = async (id: string) => {
    try {
      const conv = await chatService.getConversation(id);
      setConversationId(id);
      setMessages(conv.messages);
      setSidebarOpen(false);
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className={cn('lg:flex lg:w-72 shrink-0 flex-col', sidebarOpen ? 'flex' : 'hidden lg:flex')}>
        <Card className="flex flex-col flex-1 p-3">
          <Button className="w-full mb-3" onClick={startNewConversation}>
            <Plus className="h-4 w-4" /> New Chat
          </Button>
          <div className="flex-1 overflow-y-auto space-y-1">
            {historyData?.length ? (
              historyData.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    'group flex items-center justify-between gap-2 p-2 rounded-lg cursor-pointer transition',
                    conversationId === c.id ? 'bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                  onClick={() => loadConversation(c.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{c.title}</p>
                    <p className="text-xs text-slate-400">{timeAgo(c.updated_at)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteId(c.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No conversations yet</p>
            )}
          </div>
        </Card>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex flex-col flex-1 p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <MessageSquare className="h-4 w-4" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">AI Tutor</h2>
                <p className="text-xs text-slate-500">Powered by Google Gemini</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !typing ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white mb-4">
                  <Bot className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">How can I help you today?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center max-w-md">
                  Ask me anything about your studies. I can explain concepts, help with problems, and suggest study strategies.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl w-full">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-left text-sm text-slate-700 dark:text-slate-200 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
                    >
                      <Sparkles className="h-4 w-4 text-primary-500 shrink-0" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
                  >
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl shrink-0',
                      msg.role === 'user'
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        : 'bg-gradient-to-br from-primary-500 to-accent-500 text-white'
                    )}>
                      {msg.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3',
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    )}>
                      {msg.role === 'assistant' ? (
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
                {typing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 flex items-center gap-1">
                      <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
                      <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
                      <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-end gap-2">
              <textarea
                className="input-field resize-none flex-1"
                rows={1}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || typing}
                className="h-11 px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation?"
        confirmText="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
