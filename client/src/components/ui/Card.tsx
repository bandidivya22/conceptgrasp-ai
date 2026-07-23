import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/format';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export const Card = ({ children, className, hover = false, ...props }: CardProps) => {
  return (
    <div
      className={cn('card p-5', hover && 'transition-all hover:shadow-md hover:-translate-y-0.5', className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const CardHeader = ({ title, subtitle, icon, action }: CardHeaderProps) => (
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-3">
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300">
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);
