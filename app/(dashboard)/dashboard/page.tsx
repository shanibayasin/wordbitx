'use client';

import React, { useState, useEffect } from 'react';
import { StatsCard } from '../../../components/ui/../dashboard/StatsCard.tsx';
import { RevenueChart } from '../../../components/ui/../dashboard/RevenueChart.tsx';
import { PipelineChart } from '../../../components/ui/../dashboard/PipelineChart.tsx';
import { Users, DollarSign, LifeBuoy, CheckSquare, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils.ts';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card.tsx';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    totalLeads: 42,
    openDealsCount: 13,
    openDealsValue: 315000,
    openTickets: 8,
    tasksDueToday: 4,
    leadsGrowth: 18.2,
    dealsGrowth: 24.5,
    ticketsChange: -12.5,
    tasksCompletedPercentage: 75,
    monthlyRevenue: [
      { month: 'Apr', revenue: 64000, dealsWon: 5 },
      { month: 'May', revenue: 78500, dealsWon: 7 },
      { month: 'Jun', revenue: 92000, dealsWon: 9 },
      { month: 'Jul', revenue: 86400, dealsWon: 8 },
      { month: 'Aug', revenue: 114000, dealsWon: 12 },
      { month: 'Sep', revenue: 142500, dealsWon: 14 },
    ],
    dealsByStage: [
      { stage: 'QUALIFIED', count: 6, totalValue: 74000 },
      { stage: 'PROPOSAL', count: 4, totalValue: 98000 },
      { stage: 'NEGOTIATION', count: 3, totalValue: 143000 },
      { stage: 'WON', count: 14, totalValue: 142500 },
      { stage: 'LOST', count: 2, totalValue: 24000 },
    ],
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Executive Revenue Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time pipeline analytics, lead acquisition velocity, and SLA telemetry.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            ● Live Synchronized
          </span>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Active Leads"
          value={stats.totalLeads}
          icon={Users}
          change={stats.leadsGrowth}
          colorVariant="indigo"
        />
        <StatsCard
          title="Open Pipeline Value"
          value={formatCurrency(stats.openDealsValue)}
          icon={DollarSign}
          change={stats.dealsGrowth}
          colorVariant="emerald"
        />
        <StatsCard
          title="Active Support Tickets"
          value={stats.openTickets}
          icon={LifeBuoy}
          change={stats.ticketsChange}
          changeLabel="resolution pace"
          colorVariant="amber"
        />
        <StatsCard
          title="Tasks Due Today"
          value={stats.tasksDueToday}
          icon={CheckSquare}
          change={stats.tasksCompletedPercentage}
          changeLabel="completion rate"
          colorVariant="purple"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={stats.monthlyRevenue} />
        <PipelineChart data={stats.dealsByStage} />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Recent Deal Movements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: 'Apex AI Platform Annual License', value: '$85,000', stage: 'NEGOTIATION', rep: 'Sarah Jenkins', time: '12m ago' },
              { title: 'Global Fintech Infrastructure', value: '$120,000', stage: 'PROPOSAL', rep: 'Marcus Wright', time: '1h ago' },
              { title: 'Cloud Data Migration Suite', value: '$45,000', stage: 'WON', rep: 'Elena Rostova', time: '3h ago' },
            ].map((deal, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{deal.title}</h4>
                  <span className="text-xs text-slate-400">Rep: {deal.rep} • {deal.time}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">{deal.value}</span>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{deal.stage}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Urgent Customer Inquiries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { subject: 'SSO SAML authentication intermittent failure', customer: 'Global Logistics Corp', priority: 'URGENT', time: '25m ago' },
              { subject: 'Webhook rate limit configuration request', customer: 'HealthMetrics Inc', priority: 'HIGH', time: '2h ago' },
              { subject: 'Billing cycle prorated invoice discrepancy', customer: 'Northstar Media', priority: 'MEDIUM', time: '5h ago' },
            ].map((ticket, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="min-w-0 pr-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{ticket.subject}</h4>
                  <span className="text-xs text-slate-400">{ticket.customer} • {ticket.time}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                  ticket.priority === 'URGENT' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {ticket.priority}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
