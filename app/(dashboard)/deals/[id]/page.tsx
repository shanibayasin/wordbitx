'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card.tsx';
import { Button } from '../../../../components/ui/Button.tsx';
import { Badge } from '../../../../components/ui/Badge.tsx';
import { ArrowLeft, Building, DollarSign, Percent, Calendar, UserCheck } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../../lib/utils.ts';

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const deal = {
    id: params?.id || 'deal_1',
    title: 'Apex AI Platform Annual License',
    value: 85000,
    stage: 'NEGOTIATION',
    probability: 75,
    customer: 'Apex Global Solutions',
    assignedTo: 'Sarah Jenkins',
    expectedClose: new Date(Date.now() + 86400000 * 14),
    createdAt: new Date(Date.now() - 86400000 * 5),
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/pipeline')} className="space-x-1.5">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Pipeline</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">{deal.title}</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Deal ID: {deal.id}</p>
            </div>
            <Badge variant="warning">{deal.stage}</Badge>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <Building className="h-4 w-4 text-slate-400" />
                <span>Customer: {deal.customer}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <DollarSign className="h-4 w-4 text-slate-400" />
                <span>Contract Value: {formatCurrency(deal.value)}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Expected Close: {formatDate(deal.expectedClose)}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <UserCheck className="h-4 w-4 text-slate-400" />
                <span>Account Exec: {deal.assignedTo}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Win Probability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900">
              <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">{deal.probability}%</span>
              <span className="text-xs text-slate-500 block mt-1 font-semibold uppercase tracking-wider">Weighted Forecast</span>
            </div>
            <p className="text-xs text-slate-500">
              Calculated Pipeline Yield:{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency((deal.value * deal.probability) / 100)}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
