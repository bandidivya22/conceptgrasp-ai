import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Layers,
  HelpCircle,
  MessageSquare,
  CalendarDays,
  TrendingUp,
  Sparkles,
  User,
  Bot,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/format';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { to: '/dashboard',       label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/documents',       label: 'Documents',      icon: FileText },
  { to: '/flashcards',      label: 'Flashcards',     icon: Layers },
  { to: '/quizzes',         label: 'Quizzes',        icon: HelpCircle },
  { to: '/chat',            label: 'AI Tutor',       icon: MessageSquare },
  { to: '/planner',         label: 'Study Planner',  icon: CalendarDays },
  { to: '/progress',        label: 'Progress',       icon: TrendingUp },
  { to: '/recommendations', label: 'AI Insights',    icon: Sparkles },
  { to: '/profile',         label: 'Profile',        icon: User },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 z-40 h-screen flex flex-col transition-all duration-300',
          // Light mode
          'bg-white/90 backdrop-blur-xl border-r border-slate-200',
          // Dark mode — glass navy sidebar
          'dark:bg-[#080f20]/80 dark:backdrop-blur-2xl dark:border-r dark:border-blue-500/10',
          'dark:shadow-[0_0_40px_rgba(59,130,246,0.06)]',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex items-center h-16 px-4 border-b border-slate-200 dark:border-blue-500/10 shrink-0',
            collapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-neon-sm">
              <Bot className="h-5 w-5" />
              <div className="absolute inset-0 rounded-xl bg-blue-500/30 blur-md -z-10" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg gradient-text whitespace-nowrap">ConceptGrasp</span>
            )}
          </div>
          <button
            onClick={onToggle}
            className={cn(
              'hidden lg:flex p-1.5 rounded-lg transition-colors',
              'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] dark:text-slate-500',
              collapsed && 'ml-0'
            )}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRight className="h-4 w-4" />
              : <ChevronLeft className="h-4 w-4" />
            }
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? [
                        // Light active
                        'bg-blue-50 text-blue-700',
                        // Dark active — neon blue highlight
                        'dark:bg-blue-600/15 dark:text-blue-300 dark:border dark:border-blue-500/25',
                        'dark:shadow-[0_0_16px_rgba(59,130,246,0.25)]',
                      ]
                    : [
                        // Light inactive
                        'text-slate-600 hover:bg-slate-100',
                        // Dark inactive
                        'dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-slate-200',
                      ],
                  collapsed && 'justify-center px-0'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {/* Active glow bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-blue-400 to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                  )}
                  <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all',
                    isActive
                      ? 'bg-blue-500/20 text-blue-300 dark:shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                      : 'bg-transparent text-slate-500 dark:text-slate-400 group-hover:bg-white/[0.06]'
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  {!collapsed && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        {user && (
          <div className={cn('p-3 border-t border-slate-200 dark:border-blue-500/10 shrink-0')}>
            <button
              onClick={() => navigate('/profile')}
              className={cn(
                'w-full flex items-center gap-3 p-2.5 rounded-xl transition-all',
                'hover:bg-slate-50 dark:hover:bg-white/[0.05] dark:hover:shadow-neon-xs',
                collapsed && 'justify-center'
              )}
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm font-bold shadow-neon-sm">
                {user.name?.charAt(0).toUpperCase() || 'U'}
                <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-md -z-10" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
                    View Profile
                  </p>
                </div>
              )}
              {!collapsed && (
                <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600 shrink-0" />
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
