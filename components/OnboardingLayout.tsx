'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface OnboardingLayoutProps {
  children: ReactNode;
}

const steps = [
  { icon: 'person_search', label: 'Role Selection', href: '/onboarding', stepNum: 1 },
  { icon: 'analytics', label: 'Industry Targeting', href: '/onboarding/industry', stepNum: 2 },
  { icon: 'assignment', label: 'Dynamic Discovery', href: '/onboarding/discovery', stepNum: 3 },
  { icon: 'cloud_upload', label: 'Document Upload', href: '/onboarding/documents', stepNum: 4 },
  { icon: 'verified', label: 'Verification', href: '/onboarding/verify', stepNum: 5 },
];

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const currentStepIndex = steps.findIndex(
    (s) => pathname === s.href || pathname.startsWith(s.href + '/')
  );

  // Enforce sequential step access
  useEffect(() => {
    if (isLoading || !user) return;
    
    const allowedStep = user.onboardingStep || 1;
    
    if (currentStepIndex !== -1) {
      const currentStepNum = steps[currentStepIndex].stepNum;
      
      // If user is trying to bypass their allowed step, redirect them back
      if (currentStepNum > allowedStep) {
        const targetStep = steps.find(s => s.stepNum === allowedStep);
        if (targetStep) {
          router.replace(targetStep.href);
        }
      }
    }
  }, [pathname, user, isLoading, router, currentStepIndex]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 border-b border-slate-200/30">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="KARM BABA" width={40} height={40} className="w-10 h-10" priority />
          <span className="text-xl font-black tracking-tight text-primary font-headline">KARM BABA</span>
        </Link>
        <div className="flex items-center gap-6">
          <span className="text-slate-500 font-medium text-sm hover:text-primary transition-colors cursor-pointer">Help</span>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-primary transition-colors">notifications</span>
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-headline font-bold text-sm">U</div>
          </div>
        </div>
      </header>

      {/* Side Navigation */}
      <aside className="hidden md:flex h-screen w-72 fixed left-0 top-0 bg-slate-50 flex-col gap-2 p-6 pt-24 z-40 border-r border-slate-200/50">
        <div className="mb-8 px-4">
          <h2 className="text-lg font-bold text-on-surface font-headline">Onboarding</h2>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest font-medium mt-1">Setup Phase</p>
        </div>
        <nav className="space-y-1">
          {steps.map((step, index) => {
            const isActive = pathname === step.href || pathname.startsWith(step.href + '/');
            const isCompleted = currentStepIndex > index;
            const allowedStep = user?.onboardingStep || 1;
            const isLocked = step.stepNum > allowedStep;

            if (isLocked) {
              return (
                <div
                  key={step.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 cursor-not-allowed transition-all duration-300"
                >
                  <span className="material-symbols-outlined opacity-50">lock</span>
                  <span className="font-headline opacity-50">{step.label}</span>
                </div>
              );
            }

            return (
              <Link
                key={step.href}
                href={step.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : isCompleted
                    ? 'text-on-surface-variant hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={isCompleted ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {isCompleted ? 'check_circle' : step.icon}
                </span>
                <span className="font-headline">{step.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-72 pt-16 min-h-screen">
        {children}
      </main>

      {/* Background Textures */}
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed -top-24 left-72 w-64 h-64 bg-primary/3 rounded-full blur-3xl pointer-events-none -z-10"></div>
    </div>
  );
}
