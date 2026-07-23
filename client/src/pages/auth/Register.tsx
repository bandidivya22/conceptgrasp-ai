import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Building2, GraduationCap, UserPlus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Input, Button, Select } from '../../components/ui';
import AuthLayout from '../../components/layout/AuthLayout';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  college: z.string().optional(),
  department: z.string().optional(),
  semester: z.coerce.number().min(1).max(12).optional(),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register: registerUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setAuthError(null);
    try {
      await registerUser(data);
      toast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        (err instanceof Error && err.message) ||
        'Registration failed. Please try again.';
      setAuthError(message);
      toast(message, 'error');
    }
  };

  return (
    <AuthLayout title="AI Powered Learning Platform" subtitle="Create your free account" maxWidth="max-w-[520px]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="John Doe"
          icon={<UserIcon className="h-4 w-4" />}
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-9 text-slate-400 hover:text-blue-400 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="College"
            placeholder="Your college"
            icon={<Building2 className="h-4 w-4" />}
            error={errors.college?.message}
            {...register('college')}
          />
          <Input
            label="Department"
            placeholder="Your department"
            icon={<GraduationCap className="h-4 w-4" />}
            error={errors.department?.message}
            {...register('department')}
          />
        </div>
        <Select label="Semester" error={errors.semester?.message} {...register('semester')}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </Select>

        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{authError}</span>
          </motion.div>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          <UserPlus className="h-4 w-4" /> Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
