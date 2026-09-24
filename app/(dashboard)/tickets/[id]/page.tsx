'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card.tsx';
import { Button } from '../../../../components/ui/Button.tsx';
import { Badge } from '../../../../components/ui/Badge.tsx';
import { ArrowLeft, Building, Calendar, UserCheck, CheckCircle2, Clock } from 'lucide-react';
import { formatDate } from '../../../../lib/utils.ts';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const ticket = {
    id: params?.id || 't_1',
    subject: 'SSO SAML authentication intermittent failure',
    description:
      'After IdP certificate rotation, approximately 5% of enterprise SSO users report 401 Unauthorized errors with message "Signature validation failed". Need investigation into clock skew tolerance and certificate caching.',
    status: 'OPEN',
    priority: 'URGENT',
    customer: 'Apex Global Solutions',
    assignedTo: 'Devon Vance',
    createdAt: new Date(Date.now() - 86400000 * 1),
    updatedAt: new Date(),
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/tickets')} className="space-x-1.5">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tickets</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">{ticket.subject}</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Ticket ID: {ticket.id}</p>
            </div>
            <Badge variant="cyan">{ticket.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <Building className="h-4 w-4 text-slate-400" />
                <span>Account: {ticket.customer}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Logged: {formatDate(ticket.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <UserCheck className="h-4 w-4 text-slate-400" />
                <span>Assignee: {ticket.assignedTo}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>SLA Response: 45 min</span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Problem Description & Trace
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed font-mono text-xs">
                {ticket.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Severity & SLA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-center">
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                {ticket.priority} PRIORITY
              </span>
              <span className="text-xs text-slate-500">Tier 1 Critical Support Escalation</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
