import React from 'react';
import { Card, CardContent } from '../ui/Card.tsx';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: number;
  changeLabel?: string;
  colorVariant?: 'indigo' | 'emerald' | 'amber' | 'purple';
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel = 'vs last month',
  colorVariant = 'indigo',
}: StatsCardProps) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400',
  };

  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition duration-150">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <div className={cn('p-2.5 rounded-lg shrink-0', colorMap[colorVariant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</span>
        </div>

        {change !== undefined && (
          <div className="mt-3 flex items-center space-x-1.5 text-xs">
            <span
              className={cn(
                'inline-flex items-center font-semibold',
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {isPositive ? <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> : <TrendingDown className="h-3.5 w-3.5 mr-0.5" />}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-slate-400">{changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
