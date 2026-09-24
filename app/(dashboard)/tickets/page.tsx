'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TicketTable } from '../../../components/tickets/TicketTable.tsx';
import { TicketForm } from '../../../components/tickets/TicketForm.tsx';
import { Ticket, Customer, User } from '../../../types/index.ts';
import { toast } from '../../../components/ui/Sonner.tsx';

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'cust_1', name: 'Jordan Lee', company: 'Apex Global Solutions', email: 'jordan@apex.io', phone: '+1 555-901-2244', organizationId: 'org_acme', createdAt: new Date() },
  { id: 'cust_2', name: 'Maya Patel', company: 'CloudScale Networks', email: 'maya@cloudscale.net', phone: '+1 555-882-3901', organizationId: 'org_acme', createdAt: new Date() },
  { id: 'cust_3', name: 'Derek Thorne', company: 'Fintech Hub Corp', email: 'derek@fintechhub.com', phone: '+1 555-334-1100', organizationId: 'org_acme', createdAt: new Date() },
];

const INITIAL_USERS: User[] = [
  { id: 'usr_1', name: 'Sarah Jenkins', email: 'sarah@acme.io', role: 'ADMIN', organizationId: 'org_acme', createdAt: new Date() },
  { id: 'usr_4', name: 'Devon Vance', email: 'devon@acme.io', role: 'SUPPORT', organizationId: 'org_acme', createdAt: new Date() },
];

const INITIAL_TICKETS: Ticket[] = [
  { id: 't_1', subject: 'SSO SAML authentication intermittent failure', description: 'After IdP cert rotation, 5% of enterprise SSO logins fail with 401 signature invalid.', status: 'OPEN', priority: 'URGENT', organizationId: 'org_acme', customerId: 'cust_1', assignedToId: 'usr_4', createdAt: new Date(Date.now() - 86400000 * 1), updatedAt: new Date() },
  { id: 't_2', subject: 'Webhook payload rate limit increase request', description: 'Client requested raising API burst limits from 500 req/min to 2,000 req/min during peak black friday traffic.', status: 'IN_PROGRESS', priority: 'HIGH', organizationId: 'org_acme', customerId: 'cust_2', assignedToId: 'usr_4', createdAt: new Date(Date.now() - 86400000 * 2), updatedAt: new Date() },
  { id: 't_3', subject: 'Billing cycle prorated invoice discrepancy', description: 'Inquiry regarding additional seat cost added mid-month on invoice #INV-9281.', status: 'RESOLVED', priority: 'MEDIUM', organizationId: 'org_acme', customerId: 'cust_3', assignedToId: 'usr_1', createdAt: new Date(Date.now() - 86400000 * 5), updatedAt: new Date() },
  { id: 't_4', subject: 'CSV Export encoding issue on UTF-8 special characters', description: 'Accented characters exported into Excel have encoding garble.', status: 'WAITING', priority: 'LOW', organizationId: 'org_acme', customerId: 'cust_1', assignedToId: 'usr_4', createdAt: new Date(Date.now() - 86400000 * 7), updatedAt: new Date() },
];

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [customers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [users] = useState<User[]>(INITIAL_USERS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleAddTicket = () => {
    setSelectedTicket(null);
    setIsFormOpen(true);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsFormOpen(true);
  };

  const handleDeleteTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    toast.success('Ticket deleted');
  };

  const handleSubmitTicket = async (data: any) => {
    if (selectedTicket) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? { ...t, ...data, updatedAt: new Date() }
            : t
        )
      );
      toast.success('Ticket updated successfully');
    } else {
      const newTicket: Ticket = {
        id: `t_${Date.now()}`,
        ...data,
        organizationId: 'org_acme',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTickets((prev) => [newTicket, ...prev]);
      toast.success('New support ticket logged');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Helpdesk Tickets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Customer inquiries, issue triage, SLA tracking, and resolution workflows.
          </p>
        </div>
      </div>

      <TicketTable
        tickets={tickets}
        customers={customers}
        users={users}
        onAddTicket={handleAddTicket}
        onEditTicket={handleEditTicket}
        onDeleteTicket={handleDeleteTicket}
        onViewTicket={(id) => router.push(`/tickets/${id}`)}
      />

      <TicketForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitTicket}
        ticket={selectedTicket}
        customers={customers}
        users={users}
      />
    </div>
  );
}
