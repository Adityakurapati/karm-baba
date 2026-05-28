'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordData } from '@/lib/user-validation';
import { ModernInput } from '@/components/ModernInput';
import { ModernButton } from '@/components/ModernButton';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [isValidCode, setIsValidCode] = useState<boolean | null>(null);

  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then((emailRes) => {
          setEmail(emailRes);
          setIsValidCode(true);
        })
        .catch((error) => {
          setIsValidCode(false);
          setError('Invalid or expired password reset link. Please request a new one.');
        });
    } else {
      setIsValidCode(false);
      setError('Missing password reset token.');
    }
  }, [oobCode]);

  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      currentPassword: 'NotRequiredForReset', // Dummy value to pass schema, Firebase reset doesn't need old pass
    }
  });

  const onSubmit = async (data: ChangePasswordData) => {
    if (!oobCode) return;
    
    setLoading(true);
    setError('');
    
    try {
      await confirmPasswordReset(auth, oobCode, data.newPassword);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while resetting the password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center bg-surface-container-low p-8 rounded-2xl shadow-soft">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-success text-3xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Password Reset Successful!</h2>
          <p className="text-on-surface-variant mb-6">
            Your password has been changed. You will be redirected to the login page shortly.
          </p>
          <Link href="/login">
            <ModernButton fullWidth>Go to Login Now</ModernButton>
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
          <h2 className="text-2xl font-black text-on-surface">Reset Password</h2>
          <p className="text-on-surface-variant mt-2 text-sm">
            {email ? `Resetting password for ${email}` : 'Enter your new password below'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl font-medium text-sm">
            {error}
          </div>
        )}

        {isValidCode === true ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <ModernInput 
              label="New Password" 
              type="password" 
              {...register('newPassword')} 
              error={errors.newPassword?.message} 
            />
            <ModernInput 
              label="Confirm New Password" 
              type="password" 
              {...register('confirmNewPassword')} 
              error={errors.confirmNewPassword?.message} 
            />

            <ModernButton type="submit" variant="primary" fullWidth loading={loading}>
              Reset Password
            </ModernButton>
          </form>
        ) : isValidCode === false ? (
          <div className="text-center">
            <Link href="/forgot-password">
              <ModernButton variant="primary" fullWidth>Request New Link</ModernButton>
            </Link>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
}
