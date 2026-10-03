'use client';

import React, { useMemo, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { Card, CardContent } from '../ui/Card.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Customer, CustomerStatus, CustomerType, Deal, Ticket, User } from '../../types/index.ts';
import { formatDate, formatCurrency } from '../../lib/utils.ts';
import {
  Search, Plus, Edit2, Trash2, ExternalLink, Building, Mail, Phone, Users, UserRoundPlus,
  Repeat2, Handshake, Wallet, Download, ListFilter, MoreHorizontal, StickyNote, BriefcaseBusiness,
  ClipboardList, Archive, X, Check,
} from 'lucide-react';

type CustomerAction = 'note' | 'deal' | 'order' | 'task';
type CustomerFilters = {
  status: string; type: string; assignedToId: string; dealer: string; industry: string;
  orderStatus: string; paymentStatus: string; createdFrom: string; createdTo: string; activityFrom: string;
};

interface CustomerTableProps {
  customers: Customer[];
  deals: Deal[];
  tickets: Ticket[];
  users?: User[];
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onViewCustomer: (id: string) => void;
  onQuickAction?: (customer: Customer, action: CustomerAction) => void;
  onBulkUpdate?: (ids: string[], updates: Partial<Customer>) => void;
  isLoading?: boolean;
}

const EMPTY_FILTERS: CustomerFilters = {
  status: '', type: '', assignedToId: '', dealer: '', industry: '', orderStatus: '', paymentStatus: '',
  createdFrom: '', createdTo: '', activityFrom: '',
};

const STATUS_BADGE: Record<CustomerStatus, 'success' | 'secondary' | 'cyan' | 'warning' | 'outline' | 'purple'> = {
  ACTIVE: 'success', INACTIVE: 'secondary', PROSPECT: 'cyan', VIP: 'purple', AT_RISK: 'warning', ARCHIVED: 'outline',
};

const statusLabel = (status?: CustomerStatus) => ({
  ACTIVE: 'Active', INACTIVE: 'Inactive', PROSPECT: 'Prospect', VIP: 'VIP', AT_RISK: 'At Risk', ARCHIVED: 'Archived',
}[status || 'ACTIVE']);

const typeLabel = (type?: CustomerType) => ({
  INDIVIDUAL: 'Individual', SMB: 'SMB', MID_MARKET: 'Mid-market', ENTERPRISE: 'Enterprise', STRATEGIC: 'Strategic',
}[type || 'ENTERPRISE']);

const activityDate = (customer: Customer) => customer.lastActivityAt || customer.updatedAt || customer.createdAt;
const isOpenDeal = (deal: Deal) => !['WON', 'LOST'].includes(deal.stage);
const csvCell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;

function StatCard({ title, value, detail, icon: Icon, accent }: { title: string; value: string; detail: string; icon: React.ElementType; accent: string }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="mt-1 truncate text-[11px] text-slate-400">{detail}</p>
        </div>
        <span className={`rounded-md p-2 ${accent}`}><Icon className="h-4 w-4" /></span>
      </CardContent>
    </Card>
  );
}

export function CustomerTable({
  customers, deals, tickets, users = [], onAddCustomer, onEditCustomer, onDeleteCustomer,
  onViewCustomer, onQuickAction, onBulkUpdate, isLoading = false,
}: CustomerTableProps) {
  const [search, setSearch] = useState('');
  const [draftFilters, setDraftFilters] = useState<CustomerFilters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<CustomerFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkAssignee, setBulkAssignee] = useState('');
  const [bulkDealer, setBulkDealer] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkTag, setBulkTag] = useState('');

  const getDeals = (customerId: string) => deals.filter((deal) => deal.customerId === customerId);
  const getTickets = (customerId: string) => tickets.filter((ticket) => ticket.customerId === customerId);
  const userName = (id?: string | null) => users.find((user) => user.id === id)?.name || 'Unassigned';

  const stats = useMemo(() => {
    const active = customers.filter((customer) => ['ACTIVE', 'VIP'].includes(customer.status || 'ACTIVE')).length;
    const recent = customers.filter((customer) => Date.now() - new Date(customer.createdAt).getTime() < 30 * 86400000).length;
    const returning = customers.filter((customer) => (customer.totalOrders || 0) > 1 || getDeals(customer.id).filter((deal) => deal.stage === 'WON').length > 1).length;
    const withDeals = customers.filter((customer) => getDeals(customer.id).some(isOpenDeal)).length;
    const withBalance = customers.filter((customer) => (customer.outstandingBalance || 0) > 0).length;
    return { active, recent, returning, withDeals, withBalance };
  }, [customers, deals]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesSearch = !needle || [customer.name, customer.company, customer.email, customer.phone, customer.id]
        .some((value) => value?.toLowerCase().includes(needle));
      const created = new Date(customer.createdAt).getTime();
      const activity = new Date(activityDate(customer)).getTime();
      return matchesSearch
        && (!filters.status || (customer.status || 'ACTIVE') === filters.status)
        && (!filters.type || (customer.customerType || 'ENTERPRISE') === filters.type)
        && (!filters.assignedToId || customer.assignedToId === filters.assignedToId)
        && (!filters.dealer || (customer.assignedDealer || '').toLowerCase().includes(filters.dealer.toLowerCase()))
        && (!filters.industry || (customer.industry || '').toLowerCase().includes(filters.industry.toLowerCase()))
        && (!filters.orderStatus || customer.orderStatus === filters.orderStatus)
        && (!filters.paymentStatus || customer.paymentStatus === filters.paymentStatus)
        && (!filters.createdFrom || created >= new Date(filters.createdFrom).getTime())
        && (!filters.createdTo || created <= new Date(`${filters.createdTo}T23:59:59`).getTime())
        && (!filters.activityFrom || activity >= new Date(filters.activityFrom).getTime());
    });
  }, [customers, filters, search]);

  const toggleSelected = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleAll = () => setSelected((current) => current.length === filtered.length ? [] : filtered.map((customer) => customer.id));

  const applyBulkUpdate = (updates: Partial<Customer>) => {
    if (!selected.length) return;
    onBulkUpdate?.(selected, updates);
    setSelected([]);
    setBulkAssignee(''); setBulkDealer(''); setBulkStatus(''); setBulkTag('');
  };

  const exportCsv = () => {
    const rows = selected.length ? filtered.filter((customer) => selected.includes(customer.id)) : filtered;
    const columns = ['Customer ID', 'Customer', 'Company', 'Email', 'Phone', 'Type', 'Salesperson', 'Dealer', 'Orders', 'Revenue', 'Outstanding', 'Status', 'Last Activity', 'Created'];
    const lines = [columns, ...rows.map((customer) => {
      const wonValue = getDeals(customer.id).filter((deal) => deal.stage === 'WON').reduce((sum, deal) => sum + deal.value, 0);
      return [customer.id, customer.name, customer.company, customer.email, customer.phone, typeLabel(customer.customerType), userName(customer.assignedToId), customer.assignedDealer, customer.totalOrders || 0, customer.totalRevenue ?? wonValue, customer.outstandingBalance || 0, statusLabel(customer.status), formatDate(activityDate(customer)), formatDate(customer.createdAt)];
    })];
    const csv = lines.map((row) => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'customers.csv'; link.click(); URL.revokeObjectURL(url);
  };

  const setDraft = (key: keyof CustomerFilters, value: string) => setDraftFilters((current) => ({ ...current, [key]: value }));
  const clearFilters = () => { setDraftFilters(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard title="Total customers" value={String(customers.length)} detail="All customer records" icon={Users} accent="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" />
        <StatCard title="Active customers" value={String(stats.active)} detail={`${customers.length ? Math.round(stats.active / customers.length * 100) : 0}% of customer base`} icon={Check} accent="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" />
        <StatCard title="New customers" value={String(stats.recent)} detail="Created in the last 30 days" icon={UserRoundPlus} accent="bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300" />
        <StatCard title="Returning customers" value={String(stats.returning)} detail="Multiple completed orders or wins" icon={Repeat2} accent="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" />
        <StatCard title="With open deals" value={String(stats.withDeals)} detail="Active sales opportunities" icon={Handshake} accent="bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300" />
        <StatCard title="Outstanding payments" value={String(stats.withBalance)} detail="Customers with an open balance" icon={Wallet} accent="bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300" />
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, company, email, phone, or customer ID" className="pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setFiltersOpen((open) => !open)}><ListFilter className="mr-1.5 h-4 w-4" />Filters{Object.values(filters).filter(Boolean).length > 0 && <Badge className="ml-2">{Object.values(filters).filter(Boolean).length}</Badge>}</Button>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="mr-1.5 h-4 w-4" />Export CSV</Button>
          <Button onClick={onAddCustomer} size="sm"><Plus className="mr-1.5 h-4 w-4" />New customer</Button>
        </div>
      </div>

      {filtersOpen && <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Select value={draftFilters.status} onChange={(event) => setDraft('status', event.target.value)}><option value="">Any status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="PROSPECT">Prospect</option><option value="VIP">VIP</option><option value="AT_RISK">At risk</option><option value="ARCHIVED">Archived</option></Select>
          <Select value={draftFilters.type} onChange={(event) => setDraft('type', event.target.value)}><option value="">Any customer type</option><option value="INDIVIDUAL">Individual</option><option value="SMB">SMB</option><option value="MID_MARKET">Mid-market</option><option value="ENTERPRISE">Enterprise</option><option value="STRATEGIC">Strategic</option></Select>
          <Select value={draftFilters.assignedToId} onChange={(event) => setDraft('assignedToId', event.target.value)}><option value="">Any salesperson</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</Select>
          <Input placeholder="Dealer" value={draftFilters.dealer} onChange={(event) => setDraft('dealer', event.target.value)} />
          <Input placeholder="Industry" value={draftFilters.industry} onChange={(event) => setDraft('industry', event.target.value)} />
          <Select value={draftFilters.orderStatus} onChange={(event) => setDraft('orderStatus', event.target.value)}><option value="">Any order status</option><option value="OPEN">Open</option><option value="PROCESSING">Processing</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></Select>
          <Select value={draftFilters.paymentStatus} onChange={(event) => setDraft('paymentStatus', event.target.value)}><option value="">Any payment status</option><option value="PAID">Paid</option><option value="PENDING">Pending</option><option value="OVERDUE">Overdue</option><option value="PARTIAL">Partial</option></Select>
          <label className="text-[11px] text-slate-500">Created from<Input type="date" value={draftFilters.createdFrom} onChange={(event) => setDraft('createdFrom', event.target.value)} /></label>
          <label className="text-[11px] text-slate-500">Created to<Input type="date" value={draftFilters.createdTo} onChange={(event) => setDraft('createdTo', event.target.value)} /></label>
          <label className="text-[11px] text-slate-500">Activity since<Input type="date" value={draftFilters.activityFrom} onChange={(event) => setDraft('activityFrom', event.target.value)} /></label>
        </div>
        <div className="mt-3 flex justify-end gap-2"><Button variant="outline" size="sm" onClick={clearFilters}><X className="mr-1 h-3.5 w-3.5" />Clear filters</Button><Button size="sm" onClick={() => setFilters(draftFilters)}>Apply filters</Button></div>
      </div>}

      {selected.length > 0 && <div className="flex flex-col gap-2 rounded-lg border border-indigo-200 bg-indigo-50/70 p-3 dark:border-indigo-900 dark:bg-indigo-950/40 lg:flex-row lg:items-center">
        <span className="mr-auto text-sm font-semibold text-indigo-900 dark:text-indigo-200">{selected.length} selected</span>
        <Select value={bulkAssignee} onChange={(event) => setBulkAssignee(event.target.value)} className="lg:w-44"><option value="">Assign salesperson</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</Select>
        <Button size="sm" variant="outline" disabled={!bulkAssignee} onClick={() => applyBulkUpdate({ assignedToId: bulkAssignee })}>Assign</Button>
        <Input className="lg:w-40" placeholder="Dealer" value={bulkDealer} onChange={(event) => setBulkDealer(event.target.value)} />
        <Button size="sm" variant="outline" disabled={!bulkDealer} onClick={() => applyBulkUpdate({ assignedDealer: bulkDealer })}>Set dealer</Button>
        <Select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)} className="lg:w-36"><option value="">Change status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="PROSPECT">Prospect</option><option value="VIP">VIP</option><option value="AT_RISK">At risk</option><option value="ARCHIVED">Archived</option></Select>
        <Button size="sm" variant="outline" disabled={!bulkStatus} onClick={() => applyBulkUpdate({ status: bulkStatus as CustomerStatus })}>Update</Button>
        <Input className="lg:w-36" placeholder="Add tag" value={bulkTag} onChange={(event) => setBulkTag(event.target.value)} />
        <Button size="sm" variant="outline" disabled={!bulkTag.trim()} onClick={() => {
          const tag = bulkTag.trim();
          const tags = Array.from(new Set(selected.flatMap((id) => customers.find((customer) => customer.id === id)?.tags || []).concat(tag)));
          applyBulkUpdate({ tags });
        }}>Add tag</Button>
        <Button size="sm" variant="outline" onClick={() => { if (window.confirm(`Archive ${selected.length} selected customers?`)) applyBulkUpdate({ status: 'ARCHIVED' }); }}><Archive className="mr-1 h-3.5 w-3.5" />Archive</Button>
        <Button size="icon" variant="ghost" title="Clear selection" onClick={() => setSelected([])}><X className="h-4 w-4" /></Button>
      </div>}

      {isLoading ? <div className="flex h-40 items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-400 dark:border-slate-800"><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />Loading customer directory...</div> : filtered.length === 0 ? <div className="rounded-lg border border-slate-200 bg-white px-4 py-12 text-center dark:border-slate-800 dark:bg-slate-900"><p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{customers.length ? 'No customers match these criteria' : 'No customers yet'}</p><p className="mt-1 text-xs text-slate-400">{customers.length ? 'Adjust your search or filters and try again.' : 'Create a customer record to begin building your customer relationships.'}</p></div> : (
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <Table className="min-w-[1720px] rounded-none border-0">
              <TableHeader><TableRow><TableHead><input aria-label="Select all customers" type="checkbox" checked={filtered.length > 0 && selected.length === filtered.length} onChange={toggleAll} /></TableHead><TableHead>Customer</TableHead><TableHead>Company</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Type</TableHead><TableHead>Salesperson</TableHead><TableHead>Dealer</TableHead><TableHead>Orders</TableHead><TableHead>Total revenue</TableHead><TableHead>Outstanding</TableHead><TableHead>Status</TableHead><TableHead>Last activity</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>{filtered.map((customer) => {
                const customerDeals = getDeals(customer.id);
                const wonValue = customerDeals.filter((deal) => deal.stage === 'WON').reduce((sum, deal) => sum + deal.value, 0);
                const revenue = customer.totalRevenue ?? wonValue;
                const status = customer.status || 'ACTIVE';
                const customerTickets = getTickets(customer.id).filter((ticket) => !['RESOLVED'].includes(ticket.status)).length;
                return <TableRow key={customer.id}>
                  <TableCell><input aria-label={`Select ${customer.name}`} type="checkbox" checked={selected.includes(customer.id)} onChange={() => toggleSelected(customer.id)} /></TableCell>
                  <TableCell><button onClick={() => onViewCustomer(customer.id)} className="flex items-center gap-2 text-left font-semibold text-slate-900 hover:text-indigo-600 dark:text-white"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><Building className="h-4 w-4" /></span><span>{customer.name}<span className="mt-0.5 block font-normal text-slate-400">{customer.id}</span></span></button></TableCell>
                  <TableCell>{customer.company || '—'}</TableCell>
                  <TableCell>{customer.email ? <a href={`mailto:${customer.email}`} className="flex items-center gap-1.5 text-indigo-600 hover:underline"><Mail className="h-3.5 w-3.5" />{customer.email}</a> : '—'}</TableCell>
                  <TableCell>{customer.phone ? <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-300"><Phone className="h-3.5 w-3.5" />{customer.phone}</a> : '—'}</TableCell>
                  <TableCell>{typeLabel(customer.customerType)}</TableCell><TableCell>{userName(customer.assignedToId || customerDeals.find((deal) => deal.assignedToId)?.assignedToId)}</TableCell><TableCell>{customer.assignedDealer || '—'}</TableCell><TableCell>{customer.totalOrders || 0}</TableCell><TableCell className="font-semibold">{formatCurrency(revenue)}</TableCell><TableCell className={(customer.outstandingBalance || 0) > 0 ? 'font-semibold text-rose-600' : ''}>{formatCurrency(customer.outstandingBalance || 0)}</TableCell>
                  <TableCell><Badge variant={STATUS_BADGE[status]}>{statusLabel(status)}</Badge></TableCell><TableCell><span title={customerTickets ? `${customerTickets} open tickets` : undefined}>{formatDate(activityDate(customer))}</span></TableCell><TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell><div className="flex items-center gap-1"><Button variant="ghost" size="icon" title="View customer" onClick={() => onViewCustomer(customer.id)}><ExternalLink className="h-4 w-4" /></Button><Button variant="ghost" size="icon" title="Edit customer" onClick={() => onEditCustomer(customer)}><Edit2 className="h-4 w-4" /></Button><details className="relative"><summary className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="More actions"><MoreHorizontal className="h-4 w-4" /></summary><div className="absolute right-0 z-20 mt-1 w-44 rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    {([['note', StickyNote, 'Add note'], ['deal', BriefcaseBusiness, 'Create deal'], ['order', Building, 'Create order'], ['task', ClipboardList, 'Create task']] as const).map(([action, Icon, label]) => <button key={action} onClick={() => onQuickAction?.(customer, action)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"><Icon className="h-3.5 w-3.5" />{label}</button>)}
                    <button onClick={() => { if (window.confirm(`Delete ${customer.name}?`)) onDeleteCustomer(customer.id); }} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"><Trash2 className="h-3.5 w-3.5" />Delete customer</button>
                  </div></details></div></TableCell>
                </TableRow>;
              })}</TableBody>
            </Table>
          </div>
          <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500 dark:border-slate-800">Showing {filtered.length} of {customers.length} customers</div>
        </div>
      )}
    </div>
  );
}