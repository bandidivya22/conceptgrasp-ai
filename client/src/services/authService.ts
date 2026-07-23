import { api } from './api';
import type { User } from '../types';

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

export const authService = {
  async updateProfile(payload: Partial<User>): Promise<User> {
    const { data } = await api.put('/auth/profile', {
      name: payload.name,
      college: payload.college,
      department: payload.department,
      semester: payload.semester,
      avatar: payload.avatar,
    });
    return mapUser(data.user);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/password', { currentPassword, newPassword });
  },
};
