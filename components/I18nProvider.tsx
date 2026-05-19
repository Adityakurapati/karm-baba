'use client';

import i18next from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import { ReactNode, useEffect, useState } from 'react';
import { translations } from '@/lib/locales';

// Initialize i18next once outside the component
if (!i18next.isInitialized) {
  i18next
    .use(initReactI18next)
    .init({
      resources: translations,
      fallbackLng: 'en',
      lng: 'en', // This will be overwritten dynamically
      interpolation: {
        escapeValue: false, // React already safe from XSS
      },
    });
}

export function I18nProvider({ children, initialLocale }: { children: ReactNode; initialLocale: string }) {
  // Sync the instance language with the server-provided locale immediately to prevent hydration mismatch
  if (i18next.language !== initialLocale) {
    i18next.changeLanguage(initialLocale);
  }

  return (
    <I18nextProvider i18n={i18next}>
      {children}
    </I18nextProvider>
  );
}
