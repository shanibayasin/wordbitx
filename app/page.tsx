'use client';

import React from 'react';
import Link from 'next/link';
import {
  Kanban,
  ShieldCheck,
  Zap,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Kanban className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Wordbit<span className="text-indigo-400">X</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              Get Started Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 lg:py-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next.js 14 • PostgreSQL • Prisma • NextAuth Multi-Tenant CRM</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Accelerate your sales velocity with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">modern intelligence</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          WordbitX unites drag-and-drop opportunity pipelines, predictive lead scoring, multi-tenant RBAC, and unified support desks into one blazing-fast workspace.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-indigo-600/30 flex items-center space-x-2">
              <span>Launch Live Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-800 px-8 py-3 rounded-xl font-semibold">
              Create Free Organization
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 backdrop-blur">
            <div className="h-10 w-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
              <Kanban className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Visual Kanban Pipeline</h3>
            <p className="text-sm text-slate-400">
              Drag-and-drop deals across QUALIFIED, PROPOSAL, NEGOTIATION, and WON stages with win probability calculators and value tracking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 backdrop-blur">
            <div className="h-10 w-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Strict Multi-Tenancy</h3>
            <p className="text-sm text-slate-400">
              Complete data isolation per organization. Seamlessly manage sales, support, and admin permissions with granular RBAC controls.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 backdrop-blur">
            <div className="h-10 w-10 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center mb-4">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Revenue Intelligence</h3>
            <p className="text-sm text-slate-400">
              Real-time closed-won trajectory charts, customer lifecycle history, support ticket SLAs, and task completion checklists.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-6 text-center text-xs text-slate-500">
        WordbitX Enterprise • Built with Next.js 14, MongoDB & NextAuth.js
      </footer>
    </div>
  );
}
