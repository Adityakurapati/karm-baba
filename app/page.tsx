'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopNavbar from '@/components/TopNavbar';

export default function Home() {
  const [activeNav, setActiveNav] = useState('deals');

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar activeNav={activeNav} setActiveNav={setActiveNav} />
      
      {/* Hero Section */}
      <main className="pt-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-headline font-black tracking-tight text-on-surface mb-6">
            Global Trade Intelligence & Deal Execution
          </h1>
          <p className="text-xl text-on-surface-variant mb-8 max-w-2xl mx-auto">
            Connect with verified suppliers and buyers worldwide. Streamline your trade operations with AI-powered deal management and real-time market insights.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/onboarding"
              className="px-8 py-3 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3 border-2 border-primary text-primary font-headline font-bold rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-16">
          {[
            {
              icon: '✓',
              title: 'Smart Deal Matching',
              desc: 'AI-powered algorithm connects you with the right trade partners based on requirements.',
            },
            {
              icon: '🔒',
              title: 'Verified Network',
              desc: 'All traders and suppliers go through rigorous verification for security and trust.',
            },
            {
              icon: '📊',
              title: 'Real-time Analytics',
              desc: 'Track market trends, deal progress, and performance metrics in one dashboard.',
            },
            {
              icon: '🤖',
              title: 'AI Assistant',
              desc: 'Get intelligent recommendations and automated workflow suggestions.',
            },
            {
              icon: '⚡',
              title: 'Fast Execution',
              desc: 'Streamlined processes to close deals faster than traditional methods.',
            },
            {
              icon: '🌍',
              title: 'Global Reach',
              desc: 'Connect with suppliers in 150+ countries with multi-language support.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-surface-container rounded-xl border border-outline-variant hover:border-primary transition-colors"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-2">{feature.title}</h3>
              <p className="text-on-surface-variant">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Create Account', href: '/create-account' },
            { label: 'Deals', href: '/deals' },
            { label: 'Network', href: '/network' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="p-4 bg-surface-container rounded-lg text-center font-headline font-bold text-primary hover:bg-primary hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant mt-20 py-8 px-6 text-center text-on-surface-variant">
        <p>&copy; 2024 KARM BABA. All rights reserved.</p>
      </footer>
    </div>
  );
}
