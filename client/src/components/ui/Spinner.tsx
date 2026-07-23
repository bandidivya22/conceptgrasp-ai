import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/format';

export const Spinner = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <Loader2 className={cn('animate-spin text-primary-500', className)} style={{ width: size, height: size }} />
);

export const FullPageSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
    <Spinner size={40} />
  </div>
);

export const LoadingOverlay = ({ message }: { message?: string }) => (
  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
    <Spinner size={32} />
    {message && <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>}
  </div>
);
