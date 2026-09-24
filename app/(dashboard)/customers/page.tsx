'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerTable } from '../../../components/customers/CustomerTable.tsx';
import { CustomerForm } from '../../../components/customers/CustomerForm.tsx';
import { Customer, Deal, Ticket } from '../../../types/index.ts';
import { toast } from '../../../components/ui/Sonner.tsx';

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'cust_1', name: 'Jordan Lee', company: 'Apex Global Solutions', email: 'jordan@apex.io', phone: '+1 555-901-2244', organizationId: 'org_acme', createdAt: new Date(Date.now() - 86400000 * 45) },
  { id: 'cust_2', name: 'Maya Patel', company: 'CloudScale Networks', email: 'maya@cloudscale.net', phone: '+1 555-882-3901', organizationId: 'org_acme', createdAt: new Date(Date.now() - 86400000 * 90) },
  { id: 'cust_3', name: 'Derek Thorne', company: 'Fintech Hub Corp', email: 'derek@fintechhub.com', phone: '+1 555-334-1100', organizationId: 'org_acme', createdAt: new Date(Date.now() - 86400000 * 30) },
  { id: 'cust_4', name: 'Sophia Sterling', company: 'Global Logistics Corp', email: 'sophia@globallogistics.com', phone: '+1 555-777-9911', organizationId: 'org_acme', createdAt: new Date(Date.now() - 86400000 * 120) },
];

const INITIAL_DEALS: Deal[] = [
  { id: 'deal_1', title: 'Apex AI Platform Annual License', value: 85000, stage: 'NEGOTIATION', probability: 75, organizationId: 'org_acme', customerId: 'cust_1', assignedToId: 'usr_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'deal_2', title: 'Global Fintech Expansion', value: 120000, stage: 'PROPOSAL', probability: 60, organizationId: 'org_acme', customerId: 'cust_3', assignedToId: 'usr_2', createdAt: new Date(), updatedAt: new Date() },
  { id: 'deal_3', title: 'Cloud Data Migration Suite', value: 45000, stage: 'WON', probability: 100, organizationId: 'org_acme', customerId: 'cust_2', assignedToId: 'usr_3', createdAt: new Date(), updatedAt: new Date() },
];

const INITIAL_TICKETS: Ticket[] = [
  { id: 't_1', subject: 'SSO SAML authentication issue', description: 'IdP cert rotated', status: 'OPEN', priority: 'URGENT', organizationId: 'org_acme', customerId: 'cust_4', assignedToId: 'usr_1', createdAt: new Date(), updatedAt: new Date() },
];

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [deals] = useState<Deal[]>(INITIAL_DEALS);
  const [tickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    toast.success('Customer account deleted');
  };

  const handleSubmitCustomer = async (data: any) => {
    if (selectedCustomer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === selectedCustomer.id ? { ...c, ...data } : c))
      );
      toast.success('Customer account updated');
    } else {
      const newCustomer: Customer = {
        id: `cust_${Date.now()}`,
        ...data,
        organizationId: 'org_acme',
        createdAt: new Date(),
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      toast.success('New customer account created');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Customer Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enterprise accounts, contract histories, and support ticket tracking.
          </p>
        </div>
      </div>

      <CustomerTable
        customers={customers}
        deals={deals}
        tickets={tickets}
        onAddCustomer={handleAddCustomer}
        onEditCustomer={handleEditCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        onViewCustomer={(id) => router.push(`/customers/${id}`)}
      />

      <CustomerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitCustomer}
        customer={selectedCustomer}
      />
    </div>
  );
}
