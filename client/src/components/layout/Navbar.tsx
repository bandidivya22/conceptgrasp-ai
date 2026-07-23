import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, LogOut, Flame, Clock, Bell, User, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    toast('Logged out successfully', 'success');
    navigate('/login');
  };

  const studyHours = user?.study_hours ?? user?.studyHours ?? 0;

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-[#080f20]/85 backdrop-blur-2xl border-b border-slate-200/60 dark:border-blue-500/10 dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left — hamburger + welcome */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.06] transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-tight">
              Welcome back,{' '}
              <span className="gradient-text font-bold">
                {user?.name?.split(' ')[0] || 'Student'}
              </span>
            </h2>
          </div>
        </div>

        {/* Right — pills + actions */}
        <div className="flex items-center gap-2">
          {/* Streak pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-200/60 dark:border-orange-500/25 dark:shadow-[0_0_12px_rgba(249,115,22,0.15)] text-orange-600 dark:text-orange-400">
            <Flame className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">{user?.streak || 0} day streak</span>
          </div>

          {/* Study hours pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/25 dark:shadow-[0_0_12px_rgba(59,130,246,0.15)] text-blue-600 dark:text-blue-400">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">{studyHours}h studied</span>
          </div>

          {/* Bell */}
          <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.06] transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#080f20] animate-pulse" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.06] transition-colors"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {/* Avatar + dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm font-bold shadow-neon-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
                <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-md -z-10" />
              </div>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 z-20 rounded-2xl bg-white dark:bg-[#0d1b33]/95 backdrop-blur-xl shadow-glass border border-slate-200 dark:border-blue-500/15 py-1.5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-blue-500/10">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    Profile
                    <ChevronRight className="h-3.5 w-3.5 ml-auto text-slate-400 dark:text-slate-600" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
