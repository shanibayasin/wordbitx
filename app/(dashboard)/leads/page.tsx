'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeadTable } from '../../../components/leads/LeadTable.tsx';
import { LeadForm } from '../../../components/leads/LeadForm.tsx';
import { Lead, User } from '../../../types/index.ts';
import { toast } from '../../../components/ui/Sonner.tsx';

const INITIAL_USERS: User[] = [
  { id: 'usr_1', name: 'Sarah Jenkins', email: 'sarah@acme.io', role: 'ADMIN', organizationId: 'org_acme', createdAt: new Date() },
  { id: 'usr_2', name: 'Marcus Wright', email: 'marcus@acme.io', role: 'SALES', organizationId: 'org_acme', createdAt: new Date() },
  { id: 'usr_3', name: 'Elena Rostova', email: 'elena@acme.io', role: 'SALES', organizationId: 'org_acme', createdAt: new Date() },
  { id: 'usr_4', name: 'Devon Vance', email: 'devon@acme.io', role: 'SUPPORT', organizationId: 'org_acme', createdAt: new Date() },
];

const INITIAL_LEADS: Lead[] = [
  { id: 'lead_1', name: 'Alex Morgan', email: 'alex.morgan@fintechcorp.com', phone: '+1 555-234-8901', source: 'LinkedIn InMail', score: 85, status: 'QUALIFIED', organizationId: 'org_acme', assignedToId: 'usr_2', createdAt: new Date(Date.now() - 86400000 * 2), updatedAt: new Date() },
  { id: 'lead_2', name: 'Samantha Vance', email: 'svance@aerodynamics.io', phone: '+1 555-891-2304', source: 'Website Form', score: 62, status: 'NEW', organizationId: 'org_acme', assignedToId: 'usr_3', createdAt: new Date(Date.now() - 86400000 * 4), updatedAt: new Date() },
  { id: 'lead_3', name: 'Liam Chen', email: 'lchen@biolabs.tech', phone: '+1 555-432-1920', source: 'Industry Conference', score: 92, status: 'FOLLOW_UP', organizationId: 'org_acme', assignedToId: 'usr_2', createdAt: new Date(Date.now() - 86400000 * 6), updatedAt: new Date() },
  { id: 'lead_4', name: 'Chloe Dubois', email: 'cdubois@parisconsult.eu', phone: '+33 1 42 68 55 00', source: 'Client Referral', score: 74, status: 'QUALIFIED', organizationId: 'org_acme', assignedToId: 'usr_1', createdAt: new Date(Date.now() - 86400000 * 9), updatedAt: new Date() },
  { id: 'lead_5', name: 'David Miller', email: 'david@constructo.com', phone: '+1 555-321-7788', source: 'Cold Outbound', score: 35, status: 'LOST', organizationId: 'org_acme', assignedToId: 'usr_3', createdAt: new Date(Date.now() - 86400000 * 15), updatedAt: new Date() },
];

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
    if (selectedLead) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === selectedLead.id
            ? { ...l, ...data, updatedAt: new Date() }
            : l
        )
      );
      toast.success('Lead updated successfully');
    } else {
      const newLead: Lead = {
        id: `lead_${Date.now()}`,
        ...data,
        organizationId: 'org_acme',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLeads((prev) => [newLead, ...prev]);
      toast.success('New lead created successfully');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Leads Inbox</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Prospect acquisition channels, scoring metrics, and sales assignments.
          </p>
        </div>
      </div>

      <LeadTable
        leads={leads}
        users={users}
        onAddLead={handleAddLead}
        onEditLead={handleEditLead}
        onDeleteLead={handleDeleteLead}
        onViewLead={(id) => router.push(`/leads/${id}`)}
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
