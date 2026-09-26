import React, { useMemo, useState } from 'react';
import { Deal, DealActivity, DealCall, DealNote, DealStage, Customer, Task, User } from '../../types/index.ts';
import { formatDate } from '../../lib/utils.ts';
import { Badge } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.tsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { DealForm } from './DealForm.tsx';
import { ArrowLeft, Activity, Building, CalendarDays, CheckCircle2, Clock3, DollarSign, Handshake, Mail, Pencil, Phone, PhoneCall, Plus, StickyNote, Trash2, Trophy, UserRound, Users, X } from 'lucide-react';

 type DealTab = 'Overview' | 'Customer' | 'Activities' | 'Tasks' | 'Calls' | 'Notes' | 'Stage History';
 type StageChange = { lossReason?: string; lossNotes?: string; customerId?: string | null };

interface DealDetailsProps {
  deal: Deal;
  customer?: Customer | null;
  customers: Customer[];
  tasks: Task[];
  users: User[];
  currentUser: User;
  onBack: () => void;
  onOpenCustomer: (id: string) => void;
  onSaveDeal: (id: string, data: any) => Promise<void> | void;
  onUpdateStage: (id: string, stage: DealStage, change?: StageChange) => void;
  onUpdateDeal: (id: string, updates: Partial<Deal>) => void;
  onCreateTask: (data: { title: string; assignedToId: string | null; priority: Task['priority']; dueDate: Date | null; notes: string; dealId: string }) => void;
  onCreateOrderFromDeal: (deal: Deal) => void;
}

const tabs: { name: DealTab; icon: React.ElementType }[] = [
  { name: 'Overview', icon: Handshake }, { name: 'Customer', icon: Building }, { name: 'Activities', icon: Activity },
  { name: 'Tasks', icon: CheckCircle2 }, { name: 'Calls', icon: PhoneCall }, { name: 'Notes', icon: StickyNote }, { name: 'Stage History', icon: Clock3 },
];
const elapsed = (milliseconds: number) => {
  const days = Math.floor(milliseconds / 86400000);
  const hours = Math.floor(milliseconds % 86400000 / 3600000);
  return days ? `${days}d ${hours}h` : `${hours}h`;
};

export function DealDetails({ deal, customer, customers, tasks, users, currentUser, onBack, onOpenCustomer, onSaveDeal, onUpdateStage, onUpdateDeal, onCreateTask, onCreateOrderFromDeal }: DealDetailsProps) {
  const [activeTab, setActiveTab] = useState<DealTab>('Overview');
  const [editOpen, setEditOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [callFormOpen, setCallFormOpen] = useState(false);
  const [callType, setCallType] = useState<DealCall['type']>('Outgoing');
  const [callDuration, setCallDuration] = useState('');
  const [callOutcome, setCallOutcome] = useState('Connected');
  const [callNotes, setCallNotes] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState(currentUser.id);
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [pendingStage, setPendingStage] = useState<DealStage | null>(null);
  const [lossReason, setLossReason] = useState('');
  const [lossNotes, setLossNotes] = useState('');
  const [confirmedCustomerId, setConfirmedCustomerId] = useState(deal.customerId || '');
  const [createOrder, setCreateOrder] = useState(false);

  const dealTasks = Array.from(new Map([...tasks.filter((task) => task.dealId === deal.id), ...(deal.tasks || [])].map((task) => [task.id, task])).values());
  const notes = deal.dealNotes || [];
  const calls = deal.calls || [];
  const activities = useMemo(() => [
    { id: 'created', type: 'CREATED', description: 'Deal created', user: currentUser.name, createdAt: deal.createdAt, relatedEntity: 'Deal' },
    ...(deal.activities || []),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [deal.activities, deal.createdAt, currentUser.name]);
  const openDays = Math.max(0, Math.floor((Date.now() - new Date(deal.createdAt).getTime()) / 86400000));
  const weighted = deal.value * deal.probability / 100;
  const formatDealValue = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency || 'USD', maximumFractionDigits: 0 }).format(value);
  const stageStatus = deal.status || (deal.stage === 'WON' || deal.stage === 'LOST' ? deal.stage : 'OPEN');
  const assignedUser = users.find((user) => user.id === deal.assignedToId);
  const activity = (type: DealActivity['type'], description: string, relatedEntity?: string): DealActivity => ({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, type, description, user: currentUser.name, relatedEntity, createdAt: new Date() });

  const saveNote = () => {
    const text = noteText.trim();
    if (!text) return;
    const updated = editingNoteId
      ? notes.map((note) => note.id === editingNoteId ? { ...note, content: text } : note)
      : [{ id: `note_${Date.now()}`, content: text, author: currentUser.name, createdAt: new Date() }, ...notes];
    onUpdateDeal(deal.id, { dealNotes: updated, activities: [activity('NOTE_ADDED', editingNoteId ? 'Deal note updated' : 'Deal note added', 'Note'), ...(deal.activities || [])], lastActivityAt: new Date() });
    setNoteText(''); setEditingNoteId(null);
  };

  const saveCall = (event: React.FormEvent) => {
    event.preventDefault();
    const call: DealCall = { id: `call_${Date.now()}`, date: new Date(), agent: currentUser.name, type: callType, duration: callDuration || '—', outcome: callOutcome, notes: callNotes.trim() };
    onUpdateDeal(deal.id, { calls: [call, ...calls], activities: [activity('CALL_COMPLETED', `${callType} call ${callOutcome.toLowerCase()}`, 'Call'), ...(deal.activities || [])], lastActivityAt: new Date() });
    setCallFormOpen(false); setCallDuration(''); setCallNotes('');
  };

  const saveTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    onCreateTask({ title: taskTitle.trim(), assignedToId: taskAssignee || null, priority: taskPriority, dueDate: taskDueDate ? new Date(taskDueDate) : null, notes: taskNotes.trim(), dealId: deal.id });
    setTaskTitle(''); setTaskDueDate(''); setTaskNotes('');
  };

  const confirmStage = () => {
    if (!pendingStage) return;
    if (pendingStage === 'LOST' && !lossReason) return;
    if (pendingStage === 'WON' && !confirmedCustomerId) return;
    const stageChange = pendingStage === 'LOST' ? { lossReason, lossNotes } : { customerId: confirmedCustomerId };
    onUpdateStage(deal.id, pendingStage, stageChange);
    if (pendingStage === 'WON' && createOrder) onCreateOrderFromDeal({ ...deal, customerId: confirmedCustomerId });
    setPendingStage(null);
  };

  const renderOverview = () => <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
    <Card className="xl:col-span-2"><CardHeader><CardTitle className="text-base">Deal information</CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Info icon={DollarSign} label="Deal value" value={formatDealValue(deal.value)} /><Info icon={TargetIcon} label="Pipeline" value={deal.pipeline || 'Sales Pipeline'} /><Info icon={Activity} label="Stage and probability" value={`${deal.stage} · ${deal.probability}%`} /><Info icon={UserRound} label="Priority" value={deal.priority || 'MEDIUM'} /><Info icon={Users} label="Salesperson / team" value={`${assignedUser?.name || 'Unassigned'} · ${deal.assignedTeam || 'Unassigned'}`} /><Info icon={CalendarDays} label="Expected close" value={deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : 'Not set'} /><Info icon={Clock3} label="Next follow-up" value={deal.nextFollowUp ? formatDate(deal.nextFollowUp) : 'Not scheduled'} /><Info icon={Building} label="Source" value={deal.source || 'Not provided'} /></CardContent></Card>
    <Card><CardHeader><CardTitle className="text-base">Customer</CardTitle></CardHeader><CardContent>{customer ? <button onClick={() => onOpenCustomer(customer.id)} className="w-full text-left"><p className="font-semibold text-indigo-600 hover:underline">{customer.name}</p><p className="mt-1 text-sm text-slate-500">{deal.company || customer.company || 'Company not set'}</p><p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Mail className="h-3.5 w-3.5" />{customer.email || 'No email'}</p><p className="mt-1 flex items-center gap-2 text-xs text-slate-500"><Phone className="h-3.5 w-3.5" />{customer.phone || 'No phone'}</p></button> : <p className="text-sm text-slate-400">No customer is linked.</p>}</CardContent></Card>
    <Card className="xl:col-span-2"><CardHeader><CardTitle className="text-base">Recent activity</CardTitle></CardHeader><CardContent><ActivityList entries={activities.slice(0, 5)} /></CardContent></Card>
    <Card><CardHeader><CardTitle className="text-base">Upcoming follow-up</CardTitle></CardHeader><CardContent>{deal.nextFollowUp ? <Info icon={CalendarDays} label="Next action" value={formatDate(deal.nextFollowUp)} /> : <p className="text-sm text-slate-400">No follow-up is scheduled.</p>}</CardContent></Card>
    {deal.orderHandoff && <Card><CardHeader><CardTitle className="text-base">Order handoff</CardTitle></CardHeader><CardContent className="space-y-2"><Badge variant="warning">{deal.orderHandoff.status}</Badge><Info icon={DollarSign} label="Draft amount" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.orderHandoff.currency, maximumFractionDigits: 0 }).format(deal.orderHandoff.amount)} /><Info icon={Clock3} label="Created" value={formatDate(deal.orderHandoff.createdAt)} /></CardContent></Card>}
  </div>;

  const renderTab = () => {
    switch (activeTab) {
      case 'Overview': return renderOverview();
      case 'Customer': return <Card><CardHeader><CardTitle className="text-base">Customer relationship</CardTitle></CardHeader><CardContent>{customer ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Info icon={UserRound} label="Contact" value={customer.name} /><Info icon={Building} label="Company" value={deal.company || customer.company || 'Not provided'} /><Info icon={Mail} label="Email" value={customer.email || 'Not provided'} /><Info icon={Phone} label="Phone" value={customer.phone || 'Not provided'} /><Button className="sm:col-span-2 sm:justify-self-start" variant="outline" size="sm" onClick={() => onOpenCustomer(customer.id)}>Open customer profile</Button></div> : <Empty text="No customer is linked to this deal." />}</CardContent></Card>;
      case 'Activities': return <ActivityList entries={activities} />;
      case 'Tasks': return <div className="space-y-4"><Card><CardContent className="p-4"><form onSubmit={saveTask} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5"><Input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Task name" aria-label="Task name" /><Select aria-label="Assigned user" value={taskAssignee} onChange={(event) => setTaskAssignee(event.target.value)}><option value="">Unassigned</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</Select><Select aria-label="Task priority" value={taskPriority} onChange={(event) => setTaskPriority(event.target.value as Task['priority'])}>{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => <option key={priority}>{priority}</option>)}</Select><Input aria-label="Task due date" type="date" value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} /><Button type="submit" disabled={!taskTitle.trim()}><Plus className="mr-1 h-4 w-4" />Create task</Button><Input className="sm:col-span-2 xl:col-span-5" value={taskNotes} onChange={(event) => setTaskNotes(event.target.value)} placeholder="Task notes (optional)" /></form></CardContent></Card><SimpleTable headers={['Task', 'Assigned user', 'Priority', 'Due date', 'Status', 'Notes']} rows={dealTasks.map((task) => [task.title, users.find((user) => user.id === task.assignedToId)?.name || 'Unassigned', task.priority || 'MEDIUM', task.dueDate ? formatDate(task.dueDate) : 'No date', task.completed ? 'Completed' : 'Open', task.notes || '—'])} empty="No tasks are linked to this deal." /></div>;
      case 'Calls': return <div className="space-y-3"><div className="flex justify-end"><Button size="sm" onClick={() => setCallFormOpen(true)}><PhoneCall className="mr-1.5 h-4 w-4" />Log call</Button></div><SimpleTable headers={['Date', 'Agent', 'Call type', 'Duration', 'Outcome', 'Notes']} rows={calls.map((call) => [formatDate(call.date), call.agent, call.type, call.duration, call.outcome, call.notes || '—'])} empty="No calls have been logged for this deal." /></div>;
      case 'Notes': return <div className="space-y-4"><div className="space-y-2"><textarea rows={3} value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Add deal note..." className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" /><div className="flex justify-end gap-2">{editingNoteId && <Button size="sm" variant="outline" onClick={() => { setEditingNoteId(null); setNoteText(''); }}>Cancel</Button>}<Button size="sm" disabled={!noteText.trim()} onClick={saveNote}><Plus className="mr-1 h-4 w-4" />{editingNoteId ? 'Save note' : 'Add note'}</Button></div></div>{notes.length ? <div className="space-y-3">{notes.map((note) => <div key={note.id} className="rounded-md border border-slate-200 p-4 dark:border-slate-800"><div className="flex items-start justify-between gap-3"><div><p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{note.content}</p><p className="mt-2 text-xs text-slate-400">{note.author} · {new Date(note.createdAt).toLocaleString()}</p></div><div className="flex"><Button size="icon" variant="ghost" title="Edit note" onClick={() => { setEditingNoteId(note.id); setNoteText(note.content); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" title="Delete note" onClick={() => onUpdateDeal(deal.id, { dealNotes: notes.filter((item) => item.id !== note.id), activities: [activity('NOTE_ADDED', 'Deal note deleted', 'Note'), ...(deal.activities || [])], lastActivityAt: new Date() })}><Trash2 className="h-4 w-4 text-rose-500" /></Button></div></div></div>)}</div> : <Empty text="No deal notes yet." />}</div>;
      case 'Stage History': return deal.stageHistory?.length ? <SimpleTable headers={['Previous stage', 'New stage', 'Changed by', 'Date/time', 'Time in previous stage']} rows={[...deal.stageHistory].reverse().map((entry) => [entry.fromStage || 'Created', entry.toStage, entry.changedBy, new Date(entry.changedAt).toLocaleString(), entry.timeInPreviousStageMs ? elapsed(entry.timeInPreviousStageMs) : '—'])} empty="No stage history is available." /> : <Empty text="Stage changes will be recorded here." />;
      default: return null;
    }
  };

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-1.5 h-4 w-4" />Pipeline</Button><Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Pencil className="mr-1.5 h-4 w-4" />Edit deal</Button></div>
    <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-bold text-slate-900 dark:text-white">{deal.title}</h1><Badge variant={deal.stage === 'WON' ? 'success' : deal.stage === 'LOST' ? 'destructive' : 'cyan'}>{deal.stage}</Badge><Badge variant={deal.priority === 'URGENT' ? 'destructive' : 'outline'}>{deal.priority || 'MEDIUM'}</Badge><Badge variant="secondary">{deal.probability}%</Badge></div><p className="mt-1 text-sm text-slate-500">{customer?.name || 'No customer'} · {deal.company || customer?.company || 'Company not set'} · {assignedUser?.name || 'Unassigned'}{deal.expectedCloseDate ? ` · Close ${formatDate(deal.expectedCloseDate)}` : ''}</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => { setActiveTab('Tasks'); }}><CheckCircle2 className="mr-1 h-4 w-4" />Create task</Button><Button size="sm" variant="outline" onClick={() => { setActiveTab('Notes'); }}><StickyNote className="mr-1 h-4 w-4" />Add note</Button><Button size="sm" variant="outline" onClick={() => setCallFormOpen(true)}><PhoneCall className="mr-1 h-4 w-4" />Log call</Button>{deal.stage !== 'WON' && deal.stage !== 'LOST' && <><Button size="sm" onClick={() => { setConfirmedCustomerId(deal.customerId || ''); setPendingStage('WON'); }}><Trophy className="mr-1 h-4 w-4" />Mark won</Button><Button size="sm" variant="destructive" onClick={() => { setLossReason(''); setPendingStage('LOST'); }}>Mark lost</Button></>}</div></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Summary label="Deal value" value={formatDealValue(deal.value)} /><Summary label="Weighted value" value={formatDealValue(weighted)} /><Summary label="Probability" value={`${deal.probability}%`} /><Summary label="Days open" value={String(openDays)} /></div>
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">{tabs.map(({ name, icon: Icon }) => <button key={name} onClick={() => setActiveTab(name)} className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium ${activeTab === name ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}><Icon className="h-3.5 w-3.5" />{name}</button>)}</div>
    <div className="min-h-60">{renderTab()}</div>
    <DealForm open={editOpen} onOpenChange={setEditOpen} deal={deal} customers={customers} users={users} onSubmit={(data) => onSaveDeal(deal.id, data)} />
    <Dialog open={callFormOpen} onOpenChange={setCallFormOpen}><DialogContent><DialogHeader onClose={() => setCallFormOpen(false)}><DialogTitle>Log deal call</DialogTitle><DialogDescription>Record a sales interaction for this opportunity.</DialogDescription></DialogHeader><form onSubmit={saveCall} className="space-y-3"><Select aria-label="Call type" value={callType} onChange={(event) => setCallType(event.target.value as DealCall['type'])}>{['Incoming', 'Outgoing', 'Missed', 'Callback'].map((type) => <option key={type}>{type}</option>)}</Select><Input aria-label="Call duration" value={callDuration} onChange={(event) => setCallDuration(event.target.value)} placeholder="Duration, e.g. 18 min" /><Input aria-label="Call outcome" value={callOutcome} onChange={(event) => setCallOutcome(event.target.value)} placeholder="Outcome" /><textarea aria-label="Call notes" value={callNotes} onChange={(event) => setCallNotes(event.target.value)} rows={3} placeholder="Call notes" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" /><DialogFooter><Button type="button" variant="outline" onClick={() => setCallFormOpen(false)}>Cancel</Button><Button type="submit">Save call</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={Boolean(pendingStage)} onOpenChange={(open) => { if (!open) setPendingStage(null); }}><DialogContent><DialogHeader onClose={() => setPendingStage(null)}><DialogTitle>{pendingStage === 'WON' ? 'Confirm won deal' : 'Close deal as lost'}</DialogTitle><DialogDescription>{pendingStage === 'WON' ? 'Confirm the customer and choose whether to create an order handoff.' : 'Select a loss reason before closing this deal.'}</DialogDescription></DialogHeader>{pendingStage === 'WON' ? <div className="space-y-3"><p className="font-semibold">{deal.title} · {formatDealValue(deal.value)}</p><label className="block space-y-1 text-xs font-medium">Confirm customer<Select value={confirmedCustomerId} onChange={(event) => setConfirmedCustomerId(event.target.value)}><option value="">Select customer</option>{customers.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}{entry.company ? ` · ${entry.company}` : ''}</option>)}</Select></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={createOrder} onChange={(event) => setCreateOrder(event.target.checked)} />Create order handoff</label></div> : <div className="space-y-3"><label className="block space-y-1 text-xs font-medium">Loss reason *<Select value={lossReason} onChange={(event) => setLossReason(event.target.value)}><option value="">Select a reason</option>{['Price', 'Competitor', 'No Budget', 'Not Interested', 'Timing', 'Other'].map((reason) => <option key={reason}>{reason}</option>)}</Select></label><label className="block space-y-1 text-xs font-medium">Additional notes<textarea rows={3} value={lossNotes} onChange={(event) => setLossNotes(event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" /></label></div>}<DialogFooter><Button variant="outline" onClick={() => setPendingStage(null)}>Cancel</Button><Button variant={pendingStage === 'LOST' ? 'destructive' : 'default'} disabled={pendingStage === 'LOST' ? !lossReason : !confirmedCustomerId} onClick={confirmStage}>{pendingStage === 'WON' ? 'Confirm won' : 'Mark lost'}</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) { return <div className="flex min-w-0 items-start gap-2"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div className="min-w-0"><p className="text-[11px] text-slate-400">{label}</p><p className="wrap-break-word text-sm text-slate-700 dark:text-slate-200">{value}</p></div></div>; }
function Summary({ label, value }: { label: string; value: string }) { return <Card><CardContent className="p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{value}</p></CardContent></Card>; }
function Empty({ text }: { text: string }) { return <div className="rounded-md border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500 dark:border-slate-800">{text}</div>; }
function SimpleTable({ headers, rows, empty }: { headers: string[]; rows: React.ReactNode[][]; empty: string }) { if (!rows.length) return <Empty text={empty} />; return <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800"><table className="w-full min-w-180 text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-3 py-3 font-medium">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="whitespace-nowrap px-3 py-3">{cell}</td>)}</tr>)}</tbody></table></div>; }
function ActivityList({ entries }: { entries: Array<{ id: string; type: string; description: string; user: string; createdAt: Date | string; relatedEntity?: string }> }) { return entries.length ? <div className="space-y-3">{entries.map((entry) => <div key={entry.id} className="flex gap-3 border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><Activity className="h-4 w-4" /></span><div className="min-w-0"><p className="text-sm font-medium text-slate-800 dark:text-slate-200">{entry.description}</p><p className="mt-1 text-xs text-slate-400">{entry.user} · {entry.relatedEntity || entry.type} · {new Date(entry.createdAt).toLocaleString()}</p></div></div>)}</div> : <Empty text="No activity has been recorded for this deal." />; }
function TargetIcon(props: React.ComponentProps<typeof Activity>) { return <Activity {...props} />; }

export default DealDetails;
