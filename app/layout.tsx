import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "react-hot-toast";
import { cookies } from "next/headers";
import { I18nProvider } from "@/components/I18nProvider";
import Script from "next/script";

const manrope = Manrope({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "KARM BABA | Global Trade Intelligence & Deal Execution",
  description: "Global Trade Intelligence Platform with CRM, Deal Management, and AI-powered insights",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className="light">
      <body className={`${manrope.variable} ${inter.variable} antialiased bg-background text-on-surface`}>
        <I18nProvider initialLocale={locale}>
          <AuthProvider>
            <div id="google_translate_element" style={{ display: 'none' }}></div>
            {children}
            <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
          </AuthProvider>
        </I18nProvider>
        
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
            }
          `}
        </Script>
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
      </body>
    </html>
  );
}
