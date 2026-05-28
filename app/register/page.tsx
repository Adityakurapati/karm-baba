'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { registerUserSchema, RegisterUserData } from '@/lib/user-validation';
import { ModernInput } from '@/components/ModernInput';
import { ModernButton } from '@/components/ModernButton';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterUserData>({
    resolver: zodResolver(registerUserSchema) as any,
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterUserData) => {
    setLoading(true);
    setError('');
    
    try {
      const success = await registerUser(
        data.email, 
        data.password, 
        data.firstName, 
        data.lastName, 
        data.role, 
        '123456'
      );
      
      if (success) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
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
          <h2 className="text-2xl font-bold text-on-surface mb-2">Registration Successful!</h2>
          <p className="text-on-surface-variant mb-6">Your account has been created and is pending approval.</p>
          <ModernButton onClick={() => router.push('/login')} fullWidth>
            Go to Login
          </ModernButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white p-8 md:p-10 rounded-3xl shadow-soft">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.png" alt="KARM BABA" width={60} height={60} unoptimized />
          </Link>
          <h2 className="text-3xl font-black text-on-surface">Create an Account</h2>
          <p className="text-on-surface-variant mt-2">Join KARM BABA platform</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ModernInput label="First Name" {...register('firstName')} error={errors.firstName?.message} />
            <ModernInput label="Last Name" {...register('lastName')} error={errors.lastName?.message} />
            <ModernInput label="Email" type="email" {...register('email')} error={errors.email?.message} />
            <ModernInput label="Mobile Number" {...register('mobile')} error={errors.mobile?.message} />
            
            <ModernInput label="Designation (Optional)" {...register('designation')} error={errors.designation?.message} />
            <ModernInput label="Department (Optional)" {...register('department')} error={errors.department?.message} />
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-on-surface mb-2">Select Role</label>
              <select 
                {...register('role')} 
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none"
              >
                <option value="">Select a role...</option>
                <option value="vendor_user">Vendor User</option>
                <option value="analyst">Analyst</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="text-xs text-error mt-2 font-medium">{errors.role.message}</p>}
            </div>

            <ModernInput label="Password" type="password" {...register('password')} error={errors.password?.message} />
            <ModernInput label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
          </div>

          <ModernButton type="submit" variant="primary" fullWidth loading={loading}>
            Register
          </ModernButton>

          <p className="text-center text-on-surface-variant mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
