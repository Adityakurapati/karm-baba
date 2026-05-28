'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { resetPasswordSchema, ResetPasswordData } from '@/lib/user-validation';
import { ModernInput } from '@/components/ModernInput';
import { ModernButton } from '@/components/ModernButton';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: ResetPasswordData) => {
    setLoading(true);
    setError('');
    
    try {
      const isSent = await resetPassword(data.email);
      if (isSent) {
        setSuccess(true);
      } else {
        setError('Failed to send reset link. Please check your email and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center bg-surface-container-low p-8 rounded-2xl shadow-soft">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-success text-3xl">mail</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Check your email</h2>
          <p className="text-on-surface-variant mb-6">
            We've sent a password reset link to your email address. Please check your inbox and spam folder.
          </p>
          <Link href="/login">
            <ModernButton fullWidth>Return to Login</ModernButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-soft">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.png" alt="KARM BABA" width={60} height={60} unoptimized />
          </Link>
          <h2 className="text-2xl font-black text-on-surface">Forgot Password?</h2>
          <p className="text-on-surface-variant mt-2 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl font-medium text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <ModernInput 
            label="Email Address" 
            type="email" 
            {...register('email')} 
            error={errors.email?.message} 
            placeholder="you@example.com"
          />

          <ModernButton type="submit" variant="primary" fullWidth loading={loading}>
            Send Reset Link
          </ModernButton>

          <p className="text-center text-on-surface-variant mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-primary hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
