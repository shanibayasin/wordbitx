'use client';

import React, { useMemo, useState } from 'react';
import { Badge } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.tsx';
import { Customer, CustomerCall, CustomerNote, Deal, Task, Ticket, User } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../lib/utils.ts';
import {
  ArrowLeft, Building, Mail, Phone, CalendarDays, DollarSign, LifeBuoy, Handshake, ShoppingBag,
  FileText, CreditCard, ClipboardList, PhoneCall, StickyNote, Activity, Plus, Pencil, Trash2,
  Clock3, UserRound, Send, MoreHorizontal, Globe2, MapPin, BriefcaseBusiness, CheckCircle2, Users,
} from 'lucide-react';

type CustomerTab = 'Overview' | 'Deals' | 'Orders' | 'Invoices' | 'Payments' | 'Tickets' | 'Tasks' | 'Calls' | 'Notes' | 'Activities';
interface CustomerDetailsProps {
  customer: Customer;
  deals: Deal[];
  tickets: Ticket[];
  tasks: Task[];
  users: User[];
  onBack: () => void;
  onEdit: (customer: Customer) => void;
  onOpenDeal: (id: string) => void;
  onOpenTicket: (id: string) => void;
  onCreateDeal: (customer: Customer) => void;
  onCreateTask: (customer: Customer, title: string) => void;
  onCreateTicket: (customer: Customer) => void;
  onSaveNotes: (notes: CustomerNote[]) => void;
  onSaveCalls: (calls: CustomerCall[]) => void;
}

const tabs: { name: CustomerTab; icon: React.ElementType }[] = [
  { name: 'Overview', icon: Building }, { name: 'Deals', icon: Handshake }, { name: 'Orders', icon: ShoppingBag },
  { name: 'Invoices', icon: FileText }, { name: 'Payments', icon: CreditCard }, { name: 'Tickets', icon: LifeBuoy },
  { name: 'Tasks', icon: ClipboardList }, { name: 'Calls', icon: PhoneCall }, { name: 'Notes', icon: StickyNote },
  { name: 'Activities', icon: Activity },
];

function EmptySection({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <div className="rounded-md border border-dashed border-slate-200 px-4 py-10 text-center dark:border-slate-700"><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>{action && onAction && <Button className="mt-3" size="sm" variant="outline" onClick={onAction}><Plus className="mr-1.5 h-3.5 w-3.5" />{action}</Button>}</div>;
}

function DataTable({ headers, rows, empty, onCreate, actionLabel }: { headers: string[]; rows: React.ReactNode[][]; empty: string; onCreate?: () => void; actionLabel?: string }) {
  if (!rows.length) return <EmptySection title={empty} action={actionLabel} onAction={onCreate} />;
  return <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800"><table className="w-full min-w-180 text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/70 dark:text-slate-400"><tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-3 py-3 font-medium">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{rows.map((row, index) => <tr key={index} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">{row.map((cell, cellIndex) => <td key={cellIndex} className="whitespace-nowrap px-3 py-3 text-slate-700 dark:text-slate-300">{cell}</td>)}</tr>)}</tbody></table></div>;
}

export function CustomerDetails({ customer, deals, tickets, tasks, users, onBack, onEdit, onOpenDeal, onOpenTicket, onCreateDeal, onCreateTask, onCreateTicket, onSaveNotes, onSaveCalls }: CustomerDetailsProps) {
  const [activeTab, setActiveTab] = useState<CustomerTab>('Overview');
  const [notes, setNotes] = useState<CustomerNote[]>(() => customer.customerNotes || (customer.notes ? [{ id: 'existing-note', content: customer.notes, author: 'Team', createdAt: new Date(customer.updatedAt || customer.createdAt) }] : []));
  const [noteInput, setNoteInput] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [callLog, setCallLog] = useState<CustomerCall[]>(() => customer.calls || []);
  const [taskInput, setTaskInput] = useState('');
  const [callType, setCallType] = useState('Outgoing');

  const customerDeals = deals.filter((deal) => deal.customerId === customer.id);
  const customerTickets = tickets.filter((ticket) => ticket.customerId === customer.id);
  const customerTasks = tasks.filter((task) => task.customerId === customer.id || task.title.toLowerCase().includes(customer.name.toLowerCase()));
  const openDeals = customerDeals.filter((deal) => !['WON', 'LOST'].includes(deal.stage));
  const openTickets = customerTickets.filter((ticket) => ticket.status !== 'RESOLVED');
  const totalRevenue = customer.totalRevenue ?? customerDeals.filter((deal) => deal.stage === 'WON').reduce((sum, deal) => sum + deal.value, 0);
  const fallbackOwnerId = deals.find((deal) => deal.customerId === customer.id && deal.assignedToId)?.assignedToId;
  const assignedUser = users.find((user) => user.id === (customer.assignedToId || fallbackOwnerId));
  const lastActivity = customer.lastActivityAt || customer.updatedAt || customer.createdAt;
  const status = customer.status || 'ACTIVE';
  const statusVariant = status === 'VIP' || status === 'ACTIVE' ? 'success' : status === 'AT_RISK' ? 'warning' : status === 'PROSPECT' ? 'cyan' : status === 'ARCHIVED' ? 'outline' : 'secondary';

  const activities = useMemo(() => [
    { id: 'created', label: 'Customer created', date: new Date(customer.createdAt), icon: UserRound, actor: 'System', entity: 'Customer', detail: customer.source ? `Source: ${customer.source}` : 'Customer record added' },
    ...customerDeals.map((deal) => ({ id: deal.id, label: deal.stage === 'WON' ? 'Deal won' : `Deal ${deal.stage.toLowerCase()}`, date: new Date(deal.updatedAt || deal.createdAt), icon: Handshake, actor: users.find((user) => user.id === deal.assignedToId)?.name || 'Unassigned', entity: 'Deal', detail: deal.title })),
    ...customerTickets.map((ticket) => ({ id: ticket.id, label: `Ticket ${ticket.status.toLowerCase().replace('_', ' ')}`, date: new Date(ticket.updatedAt), icon: LifeBuoy, actor: users.find((user) => user.id === ticket.assignedToId)?.name || 'Unassigned', entity: 'Ticket', detail: ticket.subject })),
    ...customerTasks.map((task) => ({ id: task.id, label: task.completed ? 'Task completed' : 'Task created', date: new Date(task.createdAt), icon: ClipboardList, actor: users.find((user) => user.id === task.assignedToId)?.name || 'Unassigned', entity: 'Task', detail: task.title })),
    ...callLog.map((call) => ({ id: call.id, label: `${call.type} call ${call.outcome.toLowerCase()}`, date: new Date(call.date), icon: PhoneCall, actor: call.agent, entity: 'Call', detail: call.duration })),
    ...notes.map((note) => ({ id: note.id, label: 'Note added', date: new Date(note.createdAt), icon: StickyNote, actor: note.author, entity: 'Note', detail: note.content })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()), [customer, customerDeals, customerTickets, customerTasks, callLog, notes]);

  const saveNotes = (updated: CustomerNote[]) => {
    setNotes(updated);
    onSaveNotes(updated);
  };

  const addOrUpdateNote = () => {
    const content = noteInput.trim();
    if (!content) return;
    const updated = editingNote
      ? notes.map((note) => note.id === editingNote ? { ...note, content } : note)
      : [{ id: `note_${Date.now()}`, content, author: assignedUser?.name || 'You', createdAt: new Date() }, ...notes];
    saveNotes(updated); setNoteInput(''); setEditingNote(null);
  };

  const recordCall = () => {
    const outcome = window.prompt('Call outcome (Connected, Voicemail, No answer, Callback requested)', 'Connected');
    if (!outcome) return;
    const updatedCalls: CustomerCall[] = [{ id: `call_${Date.now()}`, date: new Date(), agent: assignedUser?.name || 'You', type: callType as CustomerCall['type'], duration: '—', outcome, notes: '' }, ...callLog];
    setCallLog(updatedCalls);
    onSaveCalls(updatedCalls);
  };

  const createTask = () => {
    const title = taskInput.trim();
    if (!title) return;
    onCreateTask(customer, title); setTaskInput('');
  };

  const dealRows = customerDeals.map((deal) => [<button className="font-medium text-indigo-600 hover:underline" onClick={() => onOpenDeal(deal.id)}>{deal.title}</button>, formatCurrency(deal.value), <Badge variant={deal.stage === 'WON' ? 'success' : deal.stage === 'LOST' ? 'secondary' : 'cyan'}>{deal.stage}</Badge>, `${deal.probability}%`, users.find((user) => user.id === deal.assignedToId)?.name || 'Unassigned', customer.assignedDealer || '—', '—', deal.stage === 'WON' ? 'Won' : deal.stage === 'LOST' ? 'Lost' : 'Open']);
  const ticketRows = customerTickets.map((ticket) => [<button className="font-medium text-indigo-600 hover:underline" onClick={() => onOpenTicket(ticket.id)}>{ticket.id}</button>, ticket.subject, <Badge variant={ticket.priority === 'URGENT' || ticket.priority === 'HIGH' ? 'warning' : 'secondary'}>{ticket.priority}</Badge>, users.find((user) => user.id === ticket.assignedToId)?.name || 'Unassigned', <Badge variant={ticket.status === 'RESOLVED' ? 'success' : 'cyan'}>{ticket.status.replace('_', ' ')}</Badge>, formatDate(ticket.createdAt), formatDate(ticket.updatedAt)]);
  const taskRows = customerTasks.map((task) => [task.title, users.find((user) => user.id === task.assignedToId)?.name || 'Unassigned', <Badge variant="secondary">—</Badge>, task.dueDate ? formatDate(task.dueDate) : 'No due date', <Badge variant={task.completed ? 'success' : 'warning'}>{task.completed ? 'Completed' : 'Open'}</Badge>]);

  const renderTab = () => {
    switch (activeTab) {
      case 'Overview': return <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2"><CardHeader><CardTitle className="text-base">Customer information</CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Info icon={UserRound} label="Primary contact" value={customer.name} /><Info icon={BriefcaseBusiness} label="Job title" value={customer.jobTitle || 'Not provided'} /><Info icon={Mail} label="Email" value={customer.email || 'Not provided'} /><Info icon={Phone} label="Phone" value={customer.phone || 'Not provided'} /><Info icon={Building} label="Company" value={customer.company || 'Not provided'} /><Info icon={Globe2} label="Website" value={customer.website || 'Not provided'} /><Info icon={MapPin} label="Address" value={[customer.address, customer.city, customer.state, customer.postalCode, customer.country].filter(Boolean).join(', ') || 'Not provided'} /><Info icon={CalendarDays} label="Customer since" value={formatDate(customer.createdAt)} />
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Account team</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><Info icon={UserRound} label="Salesperson" value={assignedUser?.name || 'Unassigned'} /><Info icon={Users} label="Team" value={customer.assignedTeam || 'Unassigned'} /><Info icon={Building} label="Dealer" value={customer.assignedDealer || 'Unassigned'} /></CardContent></Card>
        <Card className="xl:col-span-2"><CardHeader><CardTitle className="text-base">Recent activity</CardTitle></CardHeader><CardContent><ActivityList activities={activities.slice(0, 5)} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Upcoming follow-ups</CardTitle></CardHeader><CardContent>{customerTasks.filter((task) => !task.completed && task.dueDate && new Date(task.dueDate).getTime() >= Date.now()).length ? <div className="space-y-3">{customerTasks.filter((task) => !task.completed && task.dueDate && new Date(task.dueDate).getTime() >= Date.now()).map((task) => <div key={task.id} className="flex gap-2 text-sm"><Clock3 className="mt-0.5 h-4 w-4 text-amber-600" /><div>{task.title}<span className="mt-0.5 block text-xs text-slate-400">Due {formatDate(task.dueDate!)}</span></div></div>)}</div> : <p className="text-sm text-slate-400">No upcoming follow-ups</p>}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Active deals</CardTitle></CardHeader><CardContent className="space-y-3">{openDeals.length ? openDeals.slice(0, 4).map((deal) => <button key={deal.id} onClick={() => onOpenDeal(deal.id)} className="flex w-full items-center justify-between gap-3 text-left text-sm"><span className="truncate font-medium text-indigo-600">{deal.title}</span><span className="shrink-0 text-slate-600">{formatCurrency(deal.value)}</span></button>) : <p className="text-sm text-slate-400">No active deals</p>}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Open tickets</CardTitle></CardHeader><CardContent className="space-y-3">{openTickets.length ? openTickets.slice(0, 4).map((ticket) => <button key={ticket.id} onClick={() => onOpenTicket(ticket.id)} className="flex w-full items-center justify-between gap-3 text-left text-sm"><span className="truncate font-medium text-indigo-600">{ticket.subject}</span><Badge variant="warning">{ticket.priority}</Badge></button>) : <p className="text-sm text-slate-400">No open tickets</p>}</CardContent></Card>
      </div>;
      case 'Deals': return <div className="space-y-3"><div className="flex justify-end"><Button size="sm" onClick={() => onCreateDeal(customer)}><Plus className="mr-1 h-4 w-4" />Create deal</Button></div><DataTable headers={['Deal', 'Value', 'Stage', 'Probability', 'Salesperson', 'Dealer', 'Expected close', 'Status']} rows={dealRows} empty="No deals are linked to this customer." actionLabel="Create deal" onCreate={() => onCreateDeal(customer)} /></div>;
      case 'Orders': return <div className="space-y-3"><SummaryStrip items={[["Total orders", String(customer.totalOrders || 0)], ['Total order value', formatCurrency(customer.totalRevenue || 0)], ['Paid amount', formatCurrency(customer.paidAmount || 0)], ['Outstanding amount', formatCurrency(customer.outstandingBalance || 0)]]} /><EmptySection title="No order records are connected to this customer yet." /></div>;
      case 'Invoices': return <EmptySection title="No invoices are connected to this customer yet." />;
      case 'Payments': return <div className="space-y-3"><SummaryStrip items={[["Total paid", formatCurrency(customer.paidAmount || 0)], ['Pending', formatCurrency(customer.pendingAmount || 0)], ['Overdue', formatCurrency(customer.overdueAmount || 0)], ['Outstanding', formatCurrency(customer.outstandingBalance || 0)]]} /><EmptySection title="No payment records are connected to this customer yet." /></div>;
      case 'Tickets': return <DataTable headers={['Ticket ID', 'Subject', 'Priority', 'Assigned agent', 'Status', 'Created', 'Last updated']} rows={ticketRows} empty="No support tickets are linked to this customer." actionLabel="Create ticket" onCreate={() => onCreateTicket(customer)} />;
      case 'Tasks': return <div className="space-y-3"><form onSubmit={(event) => { event.preventDefault(); createTask(); }} className="flex gap-2"><input aria-label="Task title" value={taskInput} onChange={(event) => setTaskInput(event.target.value)} placeholder="Add a customer follow-up task" className="h-9 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900" /><Button type="submit" size="sm" disabled={!taskInput.trim()}><Plus className="mr-1 h-4 w-4" />Create task</Button></form><DataTable headers={['Task', 'Assigned user', 'Priority', 'Due date', 'Status']} rows={taskRows} empty="No tasks are linked to this customer." /></div>;
      case 'Calls': return <div className="space-y-3"><div className="flex flex-wrap items-center justify-end gap-2"><select value={callType} onChange={(event) => setCallType(event.target.value)} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"><option>Incoming</option><option>Outgoing</option><option>Missed</option><option>Callback</option></select><Button size="sm" onClick={recordCall}><PhoneCall className="mr-1.5 h-4 w-4" />Log call</Button></div><DataTable headers={['Date', 'Agent', 'Call type', 'Duration', 'Outcome', 'Notes']} rows={callLog.map((call) => [formatDate(call.date), call.agent, call.type, call.duration, call.outcome, call.notes || '—'])} empty="No calls have been logged." /></div>;
      case 'Notes': return <div className="space-y-4"><div className="space-y-2"><textarea value={noteInput} onChange={(event) => setNoteInput(event.target.value)} rows={3} placeholder="Write a customer note..." className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" /><div className="flex justify-end gap-2">{editingNote && <Button size="sm" variant="outline" onClick={() => { setEditingNote(null); setNoteInput(''); }}>Cancel</Button>}<Button size="sm" onClick={addOrUpdateNote} disabled={!noteInput.trim()}><Plus className="mr-1 h-4 w-4" />{editingNote ? 'Save note' : 'Add note'}</Button></div></div>{notes.length ? <div className="space-y-3">{notes.map((note) => <div key={note.id} className="rounded-md border border-slate-200 p-4 dark:border-slate-800"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{note.content}</p><p className="mt-2 text-xs text-slate-400">{note.author} · {new Date(note.createdAt).toLocaleString()}</p></div><div className="flex shrink-0"><Button size="icon" variant="ghost" title="Edit note" onClick={() => { setEditingNote(note.id); setNoteInput(note.content); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" title="Delete note" onClick={() => saveNotes(notes.filter((item) => item.id !== note.id))}><Trash2 className="h-4 w-4 text-rose-500" /></Button></div></div></div>)}</div> : <EmptySection title="No notes yet. Add context for the team." />}</div>;
      case 'Activities': return <ActivityList activities={activities} />;
      default: return null;
    }
  };

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-1.5 h-4 w-4" />Customers</Button><Button variant="outline" size="sm" onClick={() => onEdit(customer)}><Pencil className="mr-1.5 h-4 w-4" />Edit customer</Button></div>
    <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900"><div className="flex min-w-0 items-start gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><Building className="h-6 w-6" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-bold text-slate-900 dark:text-white">{customer.name}</h1><Badge variant={statusVariant}>{status.replace('_', ' ')}</Badge><Badge variant="outline">{(customer.customerType || 'ENTERPRISE').replace('_', ' ')}</Badge></div><p className="mt-0.5 text-sm text-slate-500">{customer.company || 'Individual customer'} · {assignedUser?.name || 'No salesperson assigned'} · {customer.assignedDealer || 'No dealer'}</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><a href={`mailto:${customer.email || ''}`} className="flex items-center gap-1.5 hover:text-indigo-600"><Mail className="h-3.5 w-3.5" />{customer.email || 'No email'}</a><a href={`tel:${customer.phone || ''}`} className="flex items-center gap-1.5 hover:text-indigo-600"><Phone className="h-3.5 w-3.5" />{customer.phone || 'No phone'}</a></div></div></div><div className="flex flex-wrap gap-2"><a href={`tel:${customer.phone || ''}`} className="inline-flex h-8 items-center rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200"><Phone className="mr-1.5 h-4 w-4" />Call</a><a href={`mailto:${customer.email || ''}`} className="inline-flex h-8 items-center rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200"><Send className="mr-1.5 h-4 w-4" />Email</a><Button size="sm" variant="outline" onClick={() => setActiveTab('Notes')}><StickyNote className="mr-1.5 h-4 w-4" />Add note</Button><Button size="icon" variant="ghost" title="More actions" onClick={() => setActiveTab('Activities')}><MoreHorizontal className="h-4 w-4" /></Button></div></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"><SummaryCard title="Total revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} /><SummaryCard title="Total orders" value={String(customer.totalOrders || 0)} icon={ShoppingBag} /><SummaryCard title="Active deals" value={String(openDeals.length)} icon={Handshake} /><SummaryCard title="Open tickets" value={String(openTickets.length)} icon={LifeBuoy} /><SummaryCard title="Outstanding" value={formatCurrency(customer.outstandingBalance || 0)} icon={CreditCard} /><SummaryCard title="Last activity" value={formatDate(lastActivity)} icon={CalendarDays} /></div>
    <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-semibold text-slate-500">Quick actions</span><Button size="sm" variant="outline" onClick={() => setActiveTab('Calls')}><PhoneCall className="mr-1.5 h-3.5 w-3.5" />Log call</Button><Button size="sm" variant="outline" onClick={() => setActiveTab('Notes')}><StickyNote className="mr-1.5 h-3.5 w-3.5" />Add note</Button><Button size="sm" variant="outline" onClick={() => setActiveTab('Tasks')}><ClipboardList className="mr-1.5 h-3.5 w-3.5" />Create task</Button><Button size="sm" variant="outline" onClick={() => onCreateDeal(customer)}><Handshake className="mr-1.5 h-3.5 w-3.5" />Create deal</Button><Button size="sm" variant="outline" onClick={() => onCreateTicket(customer)}><LifeBuoy className="mr-1.5 h-3.5 w-3.5" />Create ticket</Button><Button size="sm" variant="outline" onClick={() => window.alert('Order records are not available in this workspace yet.') }><ShoppingBag className="mr-1.5 h-3.5 w-3.5" />Create order</Button><Button size="sm" variant="outline" onClick={() => window.alert('Payment recording is not available until payment records are connected.') }><CreditCard className="mr-1.5 h-3.5 w-3.5" />Record payment</Button></div>
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">{tabs.map(({ name, icon: Icon }) => <button key={name} onClick={() => setActiveTab(name)} className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition ${activeTab === name ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}><Icon className="h-3.5 w-3.5" />{name}</button>)}</div>
    <div className="min-h-60">{renderTab()}</div>
  </div>;
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <div className="flex min-w-0 items-start gap-2"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div className="min-w-0"><p className="text-[11px] text-slate-400">{label}</p><p className="wrap-break-word text-sm text-slate-700 dark:text-slate-200">{value}</p></div></div>;
}

function SummaryCard({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) {
  return <Card><CardContent className="flex min-w-0 items-center gap-2.5 p-3"><span className="rounded-md bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Icon className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-[11px] text-slate-500">{title}</p><p className="truncate text-base font-semibold text-slate-900 dark:text-white">{value}</p></div></CardContent></Card>;
}

function SummaryStrip({ items }: { items: [string, string][] }) {
  return <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{items.map(([label, value]) => <div key={label} className="rounded-md border border-slate-200 p-3 dark:border-slate-800"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{value}</p></div>)}</div>;
}

function ActivityList({ activities }: { activities: { id: string; label: string; date: Date; icon: React.ElementType; actor: string; entity: string; detail: string }[] }) {
  if (!activities.length) return <EmptySection title="No activity has been recorded for this customer." />;
  return <div className="space-y-0">{activities.map((activity, index) => { const Icon = activity.icon; return <div key={activity.id} className="flex gap-3"><div className="flex flex-col items-center"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Icon className="h-4 w-4" /></span>{index < activities.length - 1 && <span className="my-1 w-px flex-1 bg-slate-200 dark:bg-slate-800" />}</div><div className="min-w-0 flex-1 pb-4"><p className="text-sm font-medium text-slate-800 dark:text-slate-200">{activity.label}</p><p className="mt-0.5 truncate text-xs text-slate-500">{activity.detail}</p><p className="mt-1 text-[11px] text-slate-400">{activity.actor} · {activity.entity} · {activity.date.toLocaleString()}</p></div></div>; })}</div>;
}

export default CustomerDetails;