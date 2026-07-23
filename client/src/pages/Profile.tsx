import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User as UserIcon,
  Mail,
  Building2,
  GraduationCap,
  Camera,
  Lock,
  Flame,
  Clock,
  Award,
  Save,
  Trophy,
  Crown,
  Star,
  Bot,
  Target,
  Zap,
  FileText,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { progressService } from '../services/dashboardService';
import { Card, CardHeader, Input, Button, useToast, Spinner, Badge } from '../components/ui';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  college: z.string().optional(),
  department: z.string().optional(),
  semester: z.coerce.number().min(1).max(12),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
}).refine((d) => d.currentPassword !== d.newPassword, {
  message: 'New password must be different',
  path: ['newPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

const achievementIcons: Record<string, typeof Star> = {
  Flame, Trophy, Crown, FileText, Layers, HelpCircle, Star, Bot, Award, Target, Zap,
};

export default function Profile() {
  const { user, setUser, refreshProfile } = useAuth();
  const toast = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors, isSubmitting: profileSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      college: user?.college || '',
      department: user?.department || '',
      semester: user?.semester || 1,
    },
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors, isSubmitting: passwordSubmitting }, reset: resetPassword } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const { data: progressData } = useQuery({
    queryKey: ['progress'],
    queryFn: progressService.get,
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      let avatarUrl = user?.avatar || '';
      if (avatarFile) {
        avatarUrl = avatarPreview;
      }
      const updated = await authService.updateProfile({
        name: data.name,
        college: data.college,
        department: data.department,
        semester: data.semester,
        avatar: avatarUrl,
      });
      setUser(updated);
      await refreshProfile();
      toast('Profile updated successfully', 'success');
      setAvatarFile(null);
      setAvatarPreview('');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast('Password changed successfully', 'success');
      resetPassword();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setAvatarFile(f);
      setAvatarPreview(URL.createObjectURL(f));
    }
  };

  if (!user) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  const achievements = progressData?.achievements || [];
  const studyHours = user.study_hours ?? user.studyHours ?? 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account and view your achievements</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-md cursor-pointer text-slate-600 hover:text-primary-600">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <Badge color="warning"><Flame className="h-3 w-3" /> {user.streak} day streak</Badge>
                <Badge color="primary"><Clock className="h-3 w-3" /> {studyHours}h studied</Badge>
                {user.college && <Badge color="slate">{user.college}</Badge>}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Edit Profile" icon={<UserIcon className="h-5 w-5" />} />
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <Input label="Full Name" icon={<UserIcon className="h-4 w-4" />} error={profileErrors.name?.message} {...registerProfile('name')} />
            <Input label="Email (read only)" icon={<Mail className="h-4 w-4" />} value={user.email} disabled />
            <Input label="College" icon={<Building2 className="h-4 w-4" />} error={profileErrors.college?.message} {...registerProfile('college')} />
            <Input label="Department" icon={<GraduationCap className="h-4 w-4" />} error={profileErrors.department?.message} {...registerProfile('department')} />
            <Input label="Semester" type="number" min={1} max={12} error={profileErrors.semester?.message} {...registerProfile('semester')} />
            <Button type="submit" className="w-full" loading={profileSubmitting}>
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Change Password" icon={<Lock className="h-5 w-5" />} />
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              error={passwordErrors.currentPassword?.message}
              {...registerPassword('currentPassword')}
            />
            <Input
              label="New Password"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              error={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword')}
            />
            <Button type="submit" className="w-full" loading={passwordSubmitting}>
              Update Password
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" /> Achievements ({achievements.length})
            </h4>
            {achievements.length ? (
              <div className="grid grid-cols-2 gap-2">
                {achievements.map((a, i) => {
                  const Icon = achievementIcons[a.icon] || Award;
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                      <Icon className="h-4 w-4 text-amber-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{a.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{a.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No achievements yet. Keep learning!</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
