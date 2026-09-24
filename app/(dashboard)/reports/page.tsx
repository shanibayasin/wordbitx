'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card.tsx';
import { RevenueChart } from '../../../components/dashboard/RevenueChart.tsx';
import { PipelineChart } from '../../../components/dashboard/PipelineChart.tsx';
import { formatCurrency } from '../../../lib/utils.ts';
import { TrendingUp, Target, Award, PieChart } from 'lucide-react';

export default function ReportsPage() {
  const revenueData = [
    { month: 'Apr', revenue: 64000, dealsWon: 5 },
    { month: 'May', revenue: 78500, dealsWon: 7 },
    { month: 'Jun', revenue: 92000, dealsWon: 9 },
    { month: 'Jul', revenue: 86400, dealsWon: 8 },
    { month: 'Aug', revenue: 114000, dealsWon: 12 },
    { month: 'Sep', revenue: 142500, dealsWon: 14 },
  ];

  const pipelineData = [
    { stage: 'QUALIFIED' as const, count: 6, totalValue: 74000 },
    { stage: 'PROPOSAL' as const, count: 4, totalValue: 98000 },
    { stage: 'NEGOTIATION' as const, count: 3, totalValue: 143000 },
    { stage: 'WON' as const, count: 14, totalValue: 142500 },
    { stage: 'LOST' as const, count: 2, totalValue: 24000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Revenue & Sales Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Historical conversion rates, executive revenue pacing, and sales rep performance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Overall Win Rate</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">87.5%</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Average Deal Size</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(41500)}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Sales Velocity Cycle</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">18.4 Days</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={revenueData} />
        <PipelineChart data={pipelineData} />
      </div>
    </div>
  );
}
