import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card.tsx';
import { formatCurrency } from '../../lib/utils.ts';

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
    dealsWon: number;
  }>;
  rangeLabel?: string;
  currentMonth?: string;
  growth?: number;
}

export function RevenueChart({ data, rangeLabel = '30D', currentMonth = 'Current month', growth = 0 }: RevenueChartProps) {
  const latest = data[data.length - 1]?.revenue ?? 0;
  const previous = data[data.length - 2]?.revenue ?? latest;
  const monthLabel = currentMonth || 'Current month';
  const growthValue = Number.isFinite(growth) ? growth : ((latest - previous) / Math.max(previous, 1)) * 100;

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm min-w-0 overflow-hidden">
      <CardHeader className="flex flex-col gap-3 pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Revenue Trajectory</CardTitle>
            <CardDescription>Closed-won revenue progression over the trailing months</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-600" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Monthly Revenue ($)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.08em] text-slate-500">{monthLabel}</div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(latest)}
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              {growthValue >= 0 ? '+' : ''}{growthValue.toFixed(1)}%
            </span>
            <span className="text-emerald-600/80">({rangeLabel})</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 sm:pt-4 px-2 sm:px-6">
        <div className="h-60 sm:h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.6} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                labelStyle={{ fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
