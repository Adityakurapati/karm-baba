'use client';

import Link from 'next/link';
import TopNavbar from '@/components/TopNavbar';
import { useState } from 'react';

export default function PricingPage() {
  const [activeNav, setActiveNav] = useState('pricing');

  const plans = [
    {
      name: 'Starter',
      price: '$99',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        '✓ Up to 5 active deals',
        '✓ Basic network access',
        '✓ Email support',
        '✓ Standard verification',
        '✗ API access',
        '✗ Custom integration',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$299',
      period: '/month',
      description: 'Ideal for growing businesses',
      features: [
        '✓ Unlimited active deals',
        '✓ Full network access',
        '✓ Priority support',
        '✓ Advanced verification',
        '✓ API access',
        '✗ Custom integration',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large organizations',
      features: [
        '✓ Everything in Professional',
        '✓ Unlimited everything',
        '✓ Dedicated support',
        '✓ Custom workflows',
        '✓ Custom integration',
        '✓ SLA guarantee',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  const faqs = [
    {
      q: 'Can I change my plan anytime?',
      a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards, bank transfers, and digital payment methods.',
    },
    {
      q: 'Is there a free trial available?',
      a: 'Yes, all paid plans include a 14-day free trial with full features.',
    },
    {
      q: 'Do you offer refunds?',
      a: 'We offer a 30-day money-back guarantee if you&apos;re not satisfied.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar activeNav={activeNav} setActiveNav={setActiveNav} />

      <main className="pt-20 px-6 md:px-12 max-w-7xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-headline font-black text-on-surface mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
            Choose the perfect plan for your business. Scale as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-xl border-2 transition-all ${
                plan.highlighted
                  ? 'border-primary bg-primary/5 shadow-lg scale-105'
                  : 'border-outline-variant hover:border-primary'
              } p-8`}
            >
              {plan.highlighted && (
                <div className="mb-4 inline-block px-4 py-1 bg-primary text-white text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">
                {plan.name}
              </h3>
              <p className="text-on-surface-variant mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-headline font-black text-primary">
                  {plan.price}
                </span>
                {plan.period !== 'pricing' && (
                  <span className="text-on-surface-variant ml-2">{plan.period}</span>
                )}
              </div>
              <button
                className={`w-full py-3 font-headline font-bold rounded-lg transition-colors mb-8 ${
                  plan.highlighted
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {plan.cta}
              </button>
              <ul className="space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="text-on-surface-variant">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mb-16 bg-white rounded-xl border border-outline-variant p-8 overflow-x-auto">
          <h2 className="text-2xl font-headline font-black text-on-surface mb-8">
            Feature Comparison
          </h2>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-outline-variant">
                <th className="px-4 py-4 text-left font-headline font-bold text-on-surface">
                  Feature
                </th>
                <th className="px-4 py-4 text-left font-headline font-bold text-on-surface">
                  Starter
                </th>
                <th className="px-4 py-4 text-left font-headline font-bold text-on-surface">
                  Professional
                </th>
                <th className="px-4 py-4 text-left font-headline font-bold text-on-surface">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Active Deals', starter: '5', pro: 'Unlimited', ent: 'Unlimited' },
                { feature: 'Network Access', starter: 'Basic', pro: 'Full', ent: 'Full' },
                { feature: 'Support', starter: 'Email', pro: 'Priority', ent: 'Dedicated' },
                { feature: 'API Access', starter: '✗', pro: '✓', ent: '✓' },
                { feature: 'Custom Integration', starter: '✗', pro: '✗', ent: '✓' },
                { feature: 'SLA', starter: '✗', pro: '✗', ent: '✓' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-outline-variant hover:bg-surface-container">
                  <td className="px-4 py-4 font-bold text-on-surface">{row.feature}</td>
                  <td className="px-4 py-4 text-on-surface-variant">{row.starter}</td>
                  <td className="px-4 py-4 text-on-surface-variant">{row.pro}</td>
                  <td className="px-4 py-4 text-on-surface-variant">{row.ent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <h2 className="text-3xl font-headline font-black text-on-surface text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-lg border border-outline-variant p-6 cursor-pointer hover:border-primary transition-colors"
              >
                <summary className="font-headline font-bold text-on-surface flex justify-between items-center">
                  {faq.q}
                  <span className="text-primary group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-on-surface-variant">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary text-white rounded-xl p-12 text-center">
          <h2 className="text-3xl font-headline font-bold mb-4">Ready to get started?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Join thousands of traders and suppliers using KARM BABA. Start your free trial today.
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-8 py-3 bg-white text-primary font-headline font-bold rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </main>
    </div>
  );
}
