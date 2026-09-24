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
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm min-w-0 overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-2">
        <div>
          <CardTitle className="text-base font-semibold">Revenue Trajectory</CardTitle>
          <CardDescription>Closed-won revenue progression over the trailing months</CardDescription>
        </div>
        <div className="flex items-center space-x-2 text-xs shrink-0">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-600" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">Monthly Revenue ($)</span>
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
