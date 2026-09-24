'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PipelineBoard } from '../../../components/pipeline/PipelineBoard.tsx';
import { Deal, DealStage, User, Customer } from '../../../types/index.ts';
import { toast } from '../../../components/ui/Sonner.tsx';

const INITIAL_USERS: User[] = [
  { id: 'usr_1', name: 'Sarah Jenkins', email: 'sarah@acme.io', role: 'ADMIN', organizationId: 'org_acme', createdAt: new Date() },
  { id: 'usr_2', name: 'Marcus Wright', email: 'marcus@acme.io', role: 'SALES', organizationId: 'org_acme', createdAt: new Date() },
  { id: 'usr_3', name: 'Elena Rostova', email: 'elena@acme.io', role: 'SALES', organizationId: 'org_acme', createdAt: new Date() },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'cust_1', name: 'Apex Global', email: 'billing@apex.io', phone: '+1 555-901-2244', company: 'Apex Global Solutions', organizationId: 'org_acme', createdAt: new Date() },
  { id: 'cust_2', name: 'CloudScale Inc', email: 'ops@cloudscale.net', phone: '+1 555-882-3901', company: 'CloudScale Networks', organizationId: 'org_acme', createdAt: new Date() },
  { id: 'cust_3', name: 'Fintech Hub', email: 'contact@fintechhub.com', phone: '+1 555-334-1100', company: 'Fintech Hub Corp', organizationId: 'org_acme', createdAt: new Date() },
];

const INITIAL_DEALS: Deal[] = [
  { id: 'deal_1', title: 'Apex AI Platform Annual License', value: 85000, stage: 'NEGOTIATION', probability: 75, organizationId: 'org_acme', customerId: 'cust_1', assignedToId: 'usr_1', createdAt: new Date(Date.now() - 86400000 * 5), updatedAt: new Date() },
  { id: 'deal_2', title: 'Global Fintech Infrastructure Expansion', value: 120000, stage: 'PROPOSAL', probability: 60, organizationId: 'org_acme', customerId: 'cust_3', assignedToId: 'usr_2', createdAt: new Date(Date.now() - 86400000 * 8), updatedAt: new Date() },
  { id: 'deal_3', title: 'Cloud Data Migration & Security Suite', value: 45000, stage: 'WON', probability: 100, organizationId: 'org_acme', customerId: 'cust_2', assignedToId: 'usr_3', createdAt: new Date(Date.now() - 86400000 * 12), updatedAt: new Date() },
  { id: 'deal_4', title: 'Kubernetes Observability Enterprise Tier', value: 38000, stage: 'QUALIFIED', probability: 40, organizationId: 'org_acme', customerId: 'cust_2', assignedToId: 'usr_2', createdAt: new Date(Date.now() - 86400000 * 2), updatedAt: new Date() },
  { id: 'deal_5', title: 'Legacy Monolith Modernization Pilot', value: 25000, stage: 'LOST', probability: 0, organizationId: 'org_acme', customerId: 'cust_1', assignedToId: 'usr_3', createdAt: new Date(Date.now() - 86400000 * 20), updatedAt: new Date() },
];

export default function PipelinePage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [users] = useState<User[]>(INITIAL_USERS);
  const [customers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  const handleUpdateStage = async (dealId: string, newStage: DealStage) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage, updatedAt: new Date() } : d))
    );
    toast.success(`Deal moved to stage: ${newStage}`);
  };

  const handleCreateDeal = async (data: any) => {
    const newDeal: Deal = {
      id: `deal_${Date.now()}`,
      ...data,
      organizationId: 'org_acme',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDeals((prev) => [newDeal, ...prev]);
    toast.success('New deal created in pipeline');
  };

  return (
    <div className="space-y-6">
      <PipelineBoard
        deals={deals}
        users={users}
        customers={customers}
        onUpdateDealStage={handleUpdateStage}
        onCreateDeal={handleCreateDeal}
        onViewDeal={(id) => router.push(`/deals/${id}`)}
      />
    </div>
  );
}
