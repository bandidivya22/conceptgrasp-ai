import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { api, tokenStorage } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; college?: string; department?: string; semester?: number }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapUser = (u: any): User => ({
  id: u._id || u.id,
  name: u.name,
  email: u.email,
  college: u.college,
  department: u.department,
  semester: u.semester,
  avatar: u.avatar,
  streak: u.streak || 0,
  study_hours: u.studyHours ?? u.study_hours ?? 0,
  studyHours: u.studyHours ?? 0,
  last_active_date: u.lastActiveDate || u.last_active_date || null,
  created_at: u.createdAt || u.created_at,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const token = tokenStorage.get();
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/profile');
        if (mounted) setUser(mapUser(data.user));
      } catch {
        tokenStorage.clear();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    tokenStorage.set(data.token);
    setUser(mapUser(data.user));
  };

  const register = async (payload: { name: string; email: string; password: string; college?: string; department?: string; semester?: number }) => {
    const { data } = await api.post('/auth/register', payload);
    tokenStorage.set(data.token);
    setUser(mapUser(data.user));
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    }
    tokenStorage.clear();
    setUser(null);
  };

  const refreshProfile = async () => {
    const token = tokenStorage.get();
    if (!token) return;
    try {
      const { data } = await api.get('/auth/profile');
      setUser(mapUser(data.user));
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
