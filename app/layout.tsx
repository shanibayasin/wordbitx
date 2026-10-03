import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WordbitX - Enterprise Multi-Tenant CRM Platform',
  description: 'WordbitX - Production-ready multi-tenant CRM with sales pipeline, leads, customer management, support ticketing, and revenue analytics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
