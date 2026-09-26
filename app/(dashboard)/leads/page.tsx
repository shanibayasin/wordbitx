'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeadForm } from '../../../components/leads/LeadForm.tsx';
import { LeadAdvancedTable } from '../../../components/leads/LeadAdvancedTable.tsx';
import { INITIAL_LEADS, INITIAL_USERS } from '../../../components/leads/leadData.ts';
import { Lead, User } from '../../../types/index.ts';
import { toast } from '../../../components/ui/Sonner.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Users, Plus, Target, TrendingUp, CircleDollarSign, AlertTriangle, BriefcaseBusiness } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.tsx';

const leadStatCards = [
  { title: 'Total Leads', value: 286, trend: '+12.4%', icon: Users, tone: 'indigo' },
  { title: 'New Leads', value: 42, trend: '+8.1%', icon: Plus, tone: 'emerald' },
  { title: 'Qualified Leads', value: 94, trend: '+14.2%', icon: Target, tone: 'purple' },
  { title: 'Converted Leads', value: 31, trend: '+7.8%', icon: CircleDollarSign, tone: 'amber' },
  { title: 'Lost Leads', value: 18, trend: '-3.6%', icon: AlertTriangle, tone: 'rose' },
  { title: 'High Priority Leads', value: 27, trend: '+9.3%', icon: BriefcaseBusiness, tone: 'sky' },
];

function LeadStatsOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
      {leadStatCards.map((item) => {
        const Icon = item.icon;
        const toneMap = {
          indigo: 'bg-indigo-50 text-indigo-600',
          emerald: 'bg-emerald-50 text-emerald-600',
          purple: 'bg-purple-50 text-purple-600',
          amber: 'bg-amber-50 text-amber-600',
          rose: 'bg-rose-50 text-rose-600',
          sky: 'bg-sky-50 text-sky-600',
        };

        const positive = !item.trend.startsWith('-');

        return (
          <Card key={item.title} className="hover:border-slate-300 transition duration-150">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{item.title}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneMap[item.tone as keyof typeof toneMap]}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <span className="text-2xl font-bold tracking-tight text-slate-900">{item.value}</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${positive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {item.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [users] = useState<User[]>(INITIAL_USERS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleAddLead = () => {
    setSelectedLead(null);
    setIsFormOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsFormOpen(true);
  };

  const handleDeleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    toast.success('Lead removed successfully');
  };

  const handleSubmitLead = async (data: any) => {
    const normalizedLead: Lead = {
      id: selectedLead?.id || `lead_${Date.now()}`,
      name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      firstName: data.firstName || data.name?.split(' ')[0] || '',
      lastName: data.lastName || data.name?.split(' ').slice(1).join(' ') || '',
      company: data.company || null,
      email: data.email || null,
      phone: data.phone || null,
      alternatePhone: data.alternatePhone || null,
      source: data.source || null,
      industry: data.industry || null,
      jobTitle: data.jobTitle || null,
      companySize: data.companySize || null,
      score: Number(data.score || 0),
      status: data.status || 'NEW',
      priority: data.priority || 'MEDIUM',
      assignedToId: data.assignedToId || null,
      assignedTeam: data.assignedTeam || null,
      assignedDealer: data.assignedDealer || null,
      nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : null,
      followUpType: data.followUpType || null,
      notes: data.notes || null,
      organizationId: 'org_acme',
      createdAt: selectedLead?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (selectedLead) {
      setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? normalizedLead : l)));
      toast.success('Lead updated successfully');
    } else {
      setLeads((prev) => [normalizedLead, ...prev]);
      toast.success('New lead created successfully');
    }
  };

  const statsSummary = useMemo(() => ({
    total: leads.length,
    qualified: leads.filter((lead) => lead.status === 'QUALIFIED').length,
    conversion: leads.filter((lead) => lead.status === 'CONVERTED').length,
  }), [leads]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Lead Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Qualification pipeline, follow-up management, and conversion velocity across sales teams.
          </p>
        </div>
        <Button onClick={handleAddLead} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <LeadStatsOverview />

      <LeadAdvancedTable
        leads={leads}
        users={users}
        onAddLead={handleAddLead}
        onEditLead={handleEditLead}
        onDeleteLead={handleDeleteLead}
        onViewLead={(id) => router.push(`/leads/${id}`)}
        onConvertLead={(lead) => router.push(`/pipeline?convertLead=${lead.id}`)}
      />

      <LeadForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitLead}
        lead={selectedLead}
        users={users}
      />
    </div>
  );
}
