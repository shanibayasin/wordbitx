'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card.tsx';
import { Button } from '../../../../components/ui/Button.tsx';
import { Badge } from '../../../../components/ui/Badge.tsx';
import { ArrowLeft, Building, Mail, Phone, Calendar, DollarSign, LifeBuoy } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../../lib/utils.ts';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const customer = {
    id: params?.id || 'cust_1',
    company: 'Apex Global Solutions',
    name: 'Jordan Lee',
    email: 'jordan@apex.io',
    phone: '+1 555-901-2244',
    createdAt: new Date(Date.now() - 86400000 * 45),
    deals: [
      { id: 'deal_1', title: 'Apex AI Platform Annual License', value: 85000, stage: 'NEGOTIATION', probability: 75 },
      { id: 'deal_5', title: 'Legacy Monolith Modernization Pilot', value: 25000, stage: 'LOST', probability: 0 },
    ],
    tickets: [
      { id: 't_1', subject: 'SSO SAML authentication intermittent failure', status: 'OPEN', priority: 'URGENT' },
      { id: 't_2', subject: 'Billing cycle prorated invoice inquiry', status: 'RESOLVED', priority: 'MEDIUM' },
    ],
  };

  const totalValue = customer.deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/customers')} className="space-x-1.5">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customers</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">{customer.company}</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Contact: {customer.name}</p>
            </div>
            <Badge variant="outline">Enterprise Account</Badge>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Client Since {formatDate(customer.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <Building className="h-4 w-4 text-slate-400" />
                <span>Account Tier: Strategic</span>
              </div>
            </div>

            {/* Linked Deals */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                <DollarSign className="h-3.5 w-3.5 text-indigo-500" />
                <span>Linked Opportunities ({customer.deals.length})</span>
              </h4>
              <div className="space-y-2">
                {customer.deals.map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => router.push(`/deals/${deal.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-300 transition"
                  >
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white">{deal.title}</h5>
                      <span className="text-xs text-slate-400">Win Probability: {deal.probability}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">
                        {formatCurrency(deal.value)}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {deal.stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked Support Tickets */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                <LifeBuoy className="h-3.5 w-3.5 text-amber-500" />
                <span>Support Tickets ({customer.tickets.length})</span>
              </h4>
              <div className="space-y-2">
                {customer.tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => router.push(`/tickets/${t.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-300 transition"
                  >
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white">{t.subject}</h5>
                      <span className="text-xs text-slate-400">Priority: {t.priority}</span>
                    </div>
                    <Badge variant={t.status === 'OPEN' ? 'cyan' : 'success'}>{t.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Value</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900">
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(totalValue)}
              </span>
              <span className="text-xs text-slate-500 block mt-1 font-semibold uppercase tracking-wider">
                Total Deal Pipeline
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
