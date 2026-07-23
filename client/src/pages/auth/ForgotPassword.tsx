import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Bot, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '../../components/ui';
import AuthLayout from '../../components/layout/AuthLayout';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setEmailValue(data.email);
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
  };

  return (
    <AuthLayout title="AI Powered Learning Platform" subtitle={sent ? 'Check your inbox for reset instructions' : 'Enter your email to receive a reset link'}>
      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl icon-glow-green mb-4">
            <CheckCircle className="h-7 w-7 text-emerald-400" />
          </div>
          <p className="text-slate-300 mb-6">
            If an account exists for <span className="font-semibold text-white">{emailValue}</span>, you'll receive a reset email shortly.
          </p>
          <Link to="/login">
            <Button variant="secondary" className="w-full">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Button>
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Send Reset Link
          </Button>
          <Link to="/login" className="flex items-center justify-center gap-1.5 text-center text-sm text-blue-400 hover:text-blue-300 font-medium pt-2 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back to Login
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
