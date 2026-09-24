import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card.tsx';
import { formatCurrency } from '../../lib/utils.ts';
import { DealStage } from '../../types/index.ts';

interface PipelineChartProps {
  data: Array<{
    stage: DealStage;
    count: number;
    totalValue: number;
  }>;
}

const STAGE_COLORS: Record<string, string> = {
  QUALIFIED: '#6366f1', // Indigo
  PROPOSAL: '#3b82f6', // Blue
  NEGOTIATION: '#f59e0b', // Amber
  WON: '#10b981', // Emerald
  LOST: '#f43f5e', // Rose
};

export function PipelineChart({ data }: PipelineChartProps) {
  return (
    <Card className="col-span-1 shadow-sm min-w-0 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Pipeline Volume</CardTitle>
        <CardDescription>Deal count by sales pipeline phase</CardDescription>
      </CardHeader>
      <CardContent className="pt-2 sm:pt-4 px-2 sm:px-6">
        <div className="h-60 sm:h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 15, left: -5, bottom: 5 }}>
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="stage"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 10 }}
                width={78}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: any, item: any) => [
                  `${value} Deals (${formatCurrency(item.payload.totalValue)})`,
                  'Stage Volume',
                ]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.stage] || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
