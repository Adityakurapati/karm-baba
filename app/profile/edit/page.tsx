'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TopNavbar from '@/components/TopNavbar';
import Sidebar from '@/components/Sidebar';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { ModernInput } from '@/components/ModernInput';
import { useAuth } from '@/lib/auth-context';
import { updateProfileSchema, UpdateProfileData } from '@/lib/user-validation';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { CameraIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function EditProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.phone,
        designation: user.designation || '',
        department: user.department || ''
      });
    }
  }, [user, reset]);

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const onSubmit = async (data: UpdateProfileData) => {
    setLoading(true);
    setError('');
    try {
      const success = await updateUserProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.mobile,
        designation: data.designation,
        department: data.department
      });
      
      if (success) {
        router.push('/profile');
      } else {
        setError('Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');
    
    try {
      // If there's an existing image, we could delete it here
      const fileExt = file.name.split('.').pop();
      const fileName = `profilePhotos/${user.id}/profile_${Date.now()}.${fileExt}`;
      const imageRef = storageRef(storage, fileName);
      
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      
      await updateUserProfile({ profileImage: downloadURL });
    } catch (err: any) {
      setError('Failed to upload image. ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user.profileImage) return;
    
    try {
      // Extract path from URL (simplified logic, may need robust parsing in production)
      const httpRef = storageRef(storage, user.profileImage);
      await deleteObject(httpRef);
    } catch(e) {
      console.error("Failed to delete old profile photo from storage", e);
    }
    await updateUserProfile({ profileImage: '' });
  };

  return (
    <div className="min-h-screen bg-surface-container flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24">
          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface">Edit Profile</h1>
                <p className="text-on-surface-variant mt-1">Update your account information</p>
              </div>
              <ModernButton variant="outline" onClick={() => router.push('/profile')}>
                Cancel
              </ModernButton>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <ModernCard className="p-6 md:p-8">
              {/* Profile Image Section */}
              <div className="mb-8 flex items-center gap-6 pb-8 border-b border-outline-variant">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border-4 border-white shadow-soft">
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                    ) : user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-primary">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-primary-dark transition-colors">
                    <CameraIcon className="w-4 h-4" />
                    <input type="file" accept="image/jpeg, image/png" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">Profile Photo</h3>
                  <p className="text-sm text-on-surface-variant mb-2">JPG or PNG, max 5MB</p>
                  {user.profileImage && (
                    <button onClick={handleRemoveImage} className="text-sm text-error font-medium flex items-center gap-1 hover:underline">
                      <TrashIcon className="w-4 h-4" /> Remove Photo
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ModernInput label="First Name" {...register('firstName')} error={errors.firstName?.message} />
                  <ModernInput label="Last Name" {...register('lastName')} error={errors.lastName?.message} />
                  <ModernInput label="Mobile Number" {...register('mobile')} error={errors.mobile?.message} />
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-on-surface mb-2">Email Address</label>
                    <input 
                      type="text" 
                      disabled 
                      value={user.email} 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface-variant cursor-not-allowed opacity-70" 
                    />
                    <p className="text-xs text-on-surface-variant mt-1">Contact support to change email</p>
                  </div>
                  
                  <ModernInput label="Designation" {...register('designation')} error={errors.designation?.message} />
                  <ModernInput label="Department" {...register('department')} error={errors.department?.message} />
                </div>

                <div className="flex justify-end pt-6 border-t border-outline-variant">
                  <ModernButton type="submit" variant="primary" loading={loading}>
                    Save Changes
                  </ModernButton>
                </div>
              </form>
            </ModernCard>
          </div>
        </main>
      </div>
    </div>
  );
}
