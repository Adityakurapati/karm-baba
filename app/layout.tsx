import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

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
  viewport: {
    width: "device-width",
    initialScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${manrope.variable} ${inter.variable} antialiased bg-background text-on-surface`}>
        {children}
      </body>
    </html>
  );
}
