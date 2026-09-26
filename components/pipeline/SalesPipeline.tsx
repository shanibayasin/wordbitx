import React, { useMemo, useState } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Deal, DealStage, Customer, User } from '../../types/index.ts';
import { StageColumn } from './StageColumn.tsx';
import { DealCard } from './DealCard.tsx';
import { DealForm } from './DealForm.tsx';
import { Button } from '../ui/Button.tsx';
import { Card, CardContent } from '../ui/Card.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { formatCurrency, formatDate } from '../../lib/utils.ts';
import { Activity, BarChart3, Download, Filter, Handshake, Plus, Search, Target, TrendingUp, Trophy, Wallet, X } from 'lucide-react';

export const PIPELINE_STAGES: Array<{ key: DealStage; label: string; color: string }> = [
  { key: 'NEW', label: 'New', color: '#94a3b8' },
  { key: 'QUALIFIED', label: 'Qualified', color: '#3b82f6' },
  { key: 'PROPOSAL', label: 'Proposal', color: '#f59e0b' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: '#8b5cf6' },
  { key: 'WON', label: 'Won', color: '#10b981' },
  { key: 'LOST', label: 'Lost', color: '#f43f5e' },
];

type StageChange = { lossReason?: string; lossNotes?: string; customerId?: string | null };
type DealFilters = {
  stage: string; status: string; priority: string; assignedToId: string; customerId: string;
  minValue: string; maxValue: string; minProbability: string; maxProbability: string;
  closeFrom: string; closeTo: string; createdFrom: string; createdTo: string;
};
interface SalesPipelineProps {
  deals: Deal[];
  users: User[];
  customers: Customer[];
  leadCount?: number;
  onUpdateDealStage: (dealId: string, newStage: DealStage, change?: StageChange) => Promise<void> | void;
  onCreateDeal: (data: any) => Promise<void> | void;
  onSaveDeal?: (id: string, data: any) => Promise<void> | void;
  onBulkUpdateDeals?: (ids: string[], updates: Partial<Deal>) => void;
  onDeleteDeals?: (ids: string[]) => void;
  onCreateOrderFromDeal?: (deal: Deal) => void;
  onViewDeal?: (id: string) => void;
}

const EMPTY_FILTERS: DealFilters = { stage: '', status: '', priority: '', assignedToId: '', customerId: '', minValue: '', maxValue: '', minProbability: '', maxProbability: '', closeFrom: '', closeTo: '', createdFrom: '', createdTo: '' };
const FINAL_STAGES: DealStage[] = ['WON', 'LOST'];
const csvCell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;

function Metric({ label, value, detail, icon: Icon, tone }: { label: string; value: string; detail: string; icon: React.ElementType; tone: string }) {
  return <Card><CardContent className="flex items-start justify-between gap-2 p-3.5"><div className="min-w-0"><p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{value}</p><p className="mt-1 truncate text-[10px] text-slate-400">{detail}</p></div><span className={`rounded-md p-2 ${tone}`}><Icon className="h-4 w-4" /></span></CardContent></Card>;
}

export function SalesPipeline({ deals, users, customers, leadCount = 0, onUpdateDealStage, onCreateDeal, onSaveDeal, onBulkUpdateDeals, onDeleteDeals, onCreateOrderFromDeal, onViewDeal }: SalesPipelineProps) {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [defaultStage, setDefaultStage] = useState<DealStage>('NEW');
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<DealFilters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<DealFilters>(EMPTY_FILTERS);
  const [mobileActiveStage, setMobileActiveStage] = useState<DealStage | 'ALL'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAssignee, setBulkAssignee] = useState('');
  const [bulkStage, setBulkStage] = useState('');
  const [bulkPriority, setBulkPriority] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '3m' | '6m' | '1y'>('30d');
  const [pendingStage, setPendingStage] = useState<{ deal: Deal; stage: DealStage } | null>(null);
  const [lossReason, setLossReason] = useState('');
  const [lossNotes, setLossNotes] = useState('');
  const [wonCustomerId, setWonCustomerId] = useState('');
  const [createOrder, setCreateOrder] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }));
  const customerById = (id?: string | null) => customers.find((customer) => customer.id === id);
  const userById = (id?: string | null) => users.find((user) => user.id === id);
  const getStatus = (deal: Deal) => deal.status || (deal.stage === 'WON' ? 'WON' : deal.stage === 'LOST' ? 'LOST' : 'OPEN');
  const weightedValue = (deal: Deal) => deal.value * deal.probability / 100;

  const filteredDeals = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const within = (value: number, min: string, max: string) => (!min || value >= Number(min)) && (!max || value <= Number(max));
    const dateWithin = (value: Date | string | null | undefined, from: string, to: string) => {
      if (!from && !to) return true;
      if (!value) return false;
      const date = new Date(value).getTime();
      return (!from || date >= new Date(from).getTime()) && (!to || date <= new Date(`${to}T23:59:59`).getTime());
    };
    return deals.filter((deal) => {
      const customer = customerById(deal.customerId);
      const owner = userById(deal.assignedToId);
      const matchedText = [deal.title, deal.company, customer?.name, customer?.company, owner?.name].some((value) => value?.toLowerCase().includes(needle));
      return (!needle || matchedText)
        && (!filters.stage || deal.stage === filters.stage)
        && (!filters.status || getStatus(deal) === filters.status)
        && (!filters.priority || (deal.priority || 'MEDIUM') === filters.priority)
        && (!filters.assignedToId || deal.assignedToId === filters.assignedToId)
        && (!filters.customerId || deal.customerId === filters.customerId)
        && within(deal.value, filters.minValue, filters.maxValue)
        && within(deal.probability, filters.minProbability, filters.maxProbability)
        && dateWithin(deal.expectedCloseDate, filters.closeFrom, filters.closeTo)
        && dateWithin(deal.createdAt, filters.createdFrom, filters.createdTo);
    });
  }, [deals, customers, users, search, filters]);

  const metrics = useMemo(() => {
    const active = deals.filter((deal) => !FINAL_STAGES.includes(deal.stage));
    const won = deals.filter((deal) => deal.stage === 'WON');
    const lost = deals.filter((deal) => deal.stage === 'LOST');
    const closed = won.length + lost.length;
    return {
      total: active.reduce((sum, deal) => sum + deal.value, 0), active: active.length, won: won.length, lost: lost.length,
      revenue: won.reduce((sum, deal) => sum + deal.value, 0),
      average: deals.length ? deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length : 0,
      conversion: closed ? won.length / closed * 100 : 0,
      expected: active.reduce((sum, deal) => sum + weightedValue(deal), 0),
    };
  }, [deals]);
  const stageData = useMemo(() => PIPELINE_STAGES.map((stage) => {
    const items = filteredDeals.filter((deal) => deal.stage === stage.key);
    return { ...stage, count: items.length, value: items.reduce((sum, deal) => sum + deal.value, 0), weighted: items.reduce((sum, deal) => sum + weightedValue(deal), 0) };
  }), [filteredDeals]);
  const analytics = useMemo(() => {
    const dayCount = { '7d': 7, '30d': 30, '3m': 90, '6m': 180, '1y': 365 }[dateRange];
    const recentCount = deals.filter((deal) => Date.now() - new Date(deal.createdAt).getTime() <= dayCount * 86400000).length;
    const monthCount = Math.min(6, Math.max(2, Math.ceil(dayCount / 30)));
    const monthly = Array.from({ length: monthCount }, (_, index) => {
      const month = new Date(); month.setDate(1); month.setMonth(month.getMonth() - monthCount + index + 1);
      const key = `${month.getFullYear()}-${month.getMonth()}`;
      const inMonth = (deal: Deal, field: 'createdAt' | 'updatedAt') => { const value = new Date(deal[field]); return `${value.getFullYear()}-${value.getMonth()}` === key; };
      return {
        month: month.toLocaleDateString(undefined, { month: 'short' }),
        revenue: deals.filter((deal) => deal.stage === 'WON' && inMonth(deal, 'updatedAt')).reduce((sum, deal) => sum + deal.value, 0),
        created: deals.filter((deal) => inMonth(deal, 'createdAt')).length,
      };
    });
    return { recentCount, monthly, outcomes: [{ name: 'Won', value: deals.filter((deal) => deal.stage === 'WON').length }, { name: 'Lost', value: deals.filter((deal) => deal.stage === 'LOST').length }] };
  }, [deals, dateRange]);

  const requestStageChange = (deal: Deal, stage: DealStage) => {
    if (deal.stage === stage) return;
    if (stage === 'WON' || stage === 'LOST') {
      setPendingStage({ deal, stage }); setWonCustomerId(deal.customerId || ''); setLossReason(''); setLossNotes(''); setCreateOrder(false); return;
    }
    onUpdateDealStage(deal.id, stage);
  };
  const handleDragStart = (event: DragStartEvent) => setActiveDeal(deals.find((deal) => deal.id === event.active.id) || null);
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDeal(null);
    if (!event.over) return;
    const deal = deals.find((entry) => entry.id === event.active.id);
    if (!deal) return;
    const stage = PIPELINE_STAGES.some((item) => item.key === event.over?.id) ? event.over.id as DealStage : deals.find((item) => item.id === event.over?.id)?.stage;
    if (stage) requestStageChange(deal, stage);
  };
  const confirmTerminalStage = () => {
    if (!pendingStage || (pendingStage.stage === 'LOST' && !lossReason) || (pendingStage.stage === 'WON' && !wonCustomerId)) return;
    const change = pendingStage.stage === 'LOST' ? { lossReason, lossNotes } : { customerId: wonCustomerId };
    onUpdateDealStage(pendingStage.deal.id, pendingStage.stage, change);
    if (pendingStage.stage === 'WON' && createOrder) onCreateOrderFromDeal?.({ ...pendingStage.deal, customerId: wonCustomerId });
    setPendingStage(null);
  };
  const openCreateForm = (stage: DealStage = 'NEW') => { setEditingDeal(null); setDefaultStage(stage); setFormOpen(true); };
  const toggleSelected = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const selectAll = () => setSelectedIds((current) => current.length === filteredDeals.length ? [] : filteredDeals.map((deal) => deal.id));
  const exportDeals = () => {
    const rows = [['Deal ID', 'Deal', 'Customer', 'Company', 'Value', 'Currency', 'Stage', 'Probability', 'Weighted Value', 'Priority', 'Salesperson', 'Expected Close', 'Created']];
    (selectedIds.length ? filteredDeals.filter((deal) => selectedIds.includes(deal.id)) : filteredDeals).forEach((deal) => rows.push([deal.id, deal.title, customerById(deal.customerId)?.name || '', deal.company || customerById(deal.customerId)?.company || '', String(deal.value), deal.currency || 'USD', deal.stage, String(deal.probability), String(weightedValue(deal)), deal.priority || 'MEDIUM', userById(deal.assignedToId)?.name || '', deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : '', formatDate(deal.createdAt)]));
    const url = URL.createObjectURL(new Blob([`\ufeff${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'deals.csv'; link.click(); URL.revokeObjectURL(url);
  };
  const applyBulk = (updates: Partial<Deal>) => { if (!selectedIds.length) return; onBulkUpdateDeals?.(selectedIds, updates); setSelectedIds([]); setBulkAssignee(''); setBulkStage(''); setBulkPriority(''); setBulkStatus(''); };
  const setFilter = (key: keyof DealFilters, value: string) => setDraftFilters((current) => ({ ...current, [key]: value }));
  const rangeOptions: Array<{ value: typeof dateRange; label: string }> = [{ value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }, { value: '3m', label: '3 months' }, { value: '6m', label: '6 months' }, { value: '1y', label: '1 year' }];

  return <div className="space-y-5">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sales Pipeline</h1><p className="text-sm text-slate-500 dark:text-slate-400">Forecast, qualify, and progress opportunities through close.</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={exportDeals}><Download className="mr-1.5 h-4 w-4" />Export CSV</Button><Button size="sm" onClick={() => openCreateForm()}><Plus className="mr-1.5 h-4 w-4" />New deal</Button></div></div>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 2xl:grid-cols-8">
      <Metric label="Total pipeline value" value={formatCurrency(metrics.total)} detail="Open deal value" icon={Wallet} tone="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" />
      <Metric label="Active deals" value={String(metrics.active)} detail="Open opportunities" icon={Handshake} tone="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" />
      <Metric label="Won deals" value={String(metrics.won)} detail="Closed won" icon={Trophy} tone="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" />
      <Metric label="Lost deals" value={String(metrics.lost)} detail="Closed lost" icon={X} tone="bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300" />
      <Metric label="Won revenue" value={formatCurrency(metrics.revenue)} detail="Closed won value" icon={TrendingUp} tone="bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300" />
      <Metric label="Average deal value" value={formatCurrency(metrics.average)} detail="Across all deals" icon={BarChart3} tone="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" />
      <Metric label="Conversion rate" value={`${metrics.conversion.toFixed(1)}%`} detail="Won / closed deals" icon={Target} tone="bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300" />
      <Metric label="Expected revenue" value={formatCurrency(metrics.expected)} detail="Open value × probability" icon={Activity} tone="bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300" />
    </div>

    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2"><CardContent className="p-4"><div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-slate-900 dark:text-white">Sales funnel</h2><p className="text-xs text-slate-500">Lead progression through close</p></div><Badge variant="outline">{leadCount} leads · {deals.length} deals</Badge></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-6">{[{ key: 'LEADS', label: 'Leads', color: '#14b8a6' }, ...PIPELINE_STAGES.filter((stage) => stage.key !== 'LOST')].map((stage, index, funnel) => { const row = stage.key === 'LEADS' ? { count: leadCount, value: 0 } : stageData.find((item) => item.key === stage.key)!; const previousKey = funnel[index - 1]?.key; const previous = previousKey === 'LEADS' ? leadCount : stageData.find((item) => item.key === previousKey)?.count || 0; return <div key={stage.key} className="min-w-0 rounded-md border border-slate-100 p-3 dark:border-slate-800"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} /><p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">{stage.label}</p></div><p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{row.count} <span className="text-xs font-normal text-slate-400">{stage.key === 'LEADS' ? 'leads' : 'deals'}</span></p><p className="text-xs text-slate-500">{stage.key === 'LEADS' ? '—' : formatCurrency(row.value)}</p><p className="mt-1 text-[10px] text-slate-400">{index ? `${previous ? (row.count / previous * 100).toFixed(0) : 0}% conversion` : '100% of funnel'}</p></div>; })}</div></CardContent></Card>
      <Card><CardContent className="p-4"><div className="mb-2 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-slate-900 dark:text-white">Pipeline analytics</h2><p className="text-xs text-slate-500">Created deals and won revenue</p></div><select aria-label="Analytics date range" value={dateRange} onChange={(event) => setDateRange(event.target.value as typeof dateRange)} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs dark:border-slate-800 dark:bg-slate-900">{rangeOptions.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}</select></div><div className="h-44 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={analytics.monthly} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis yAxisId="revenue" tick={{ fontSize: 9 }} /><YAxis yAxisId="count" orientation="right" tick={{ fontSize: 9 }} /><Tooltip formatter={(value, name) => [name === 'Revenue' ? formatCurrency(Number(value ?? 0)) : String(value ?? ''), String(name ?? '')]} /><Line yAxisId="revenue" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={false} /><Line yAxisId="count" dataKey="created" name="Deals created" stroke="#6366f1" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div><div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-800"><span className="text-slate-500">Deals created in range</span><strong className="text-slate-900 dark:text-white">{analytics.recentCount}</strong></div></CardContent></Card>
    </div>
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-4"><Card className="xl:col-span-3"><CardContent className="p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-sm font-semibold text-slate-900 dark:text-white">Pipeline value by stage</h2><p className="text-xs text-slate-500">Total deal value and weighted forecast</p></div><span className="text-xs text-slate-500">{filteredDeals.length} matching deals</span></div><div className="h-48 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={stageData} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 9 }} /><Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} /><Bar dataKey="value" name="Total value" fill="#6366f1" radius={[4, 4, 0, 0]} /><Bar dataKey="weighted" name="Weighted value" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent></Card><Card><CardContent className="p-4"><h2 className="text-sm font-semibold text-slate-900 dark:text-white">Won vs. lost</h2><p className="text-xs text-slate-500">Closed deal outcomes</p><div className="h-36"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analytics.outcomes} dataKey="value" nameKey="name" innerRadius={34} outerRadius={58} paddingAngle={3}>{analytics.outcomes.map((item, index) => <Cell key={item.name} fill={index ? '#f43f5e' : '#10b981'} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="flex justify-between text-xs"><span className="text-emerald-600">Won {metrics.won}</span><span className="text-rose-600">Lost {metrics.lost}</span></div></CardContent></Card></div>

    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="relative w-full lg:max-w-md"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search deal, customer, company, or salesperson" className="pl-9" /></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setFilterOpen((open) => !open)}><Filter className="mr-1.5 h-4 w-4" />Filters{Object.values(filters).filter(Boolean).length > 0 && <Badge className="ml-2">{Object.values(filters).filter(Boolean).length}</Badge>}</Button><Button size="sm" variant="outline" onClick={exportDeals}><Download className="mr-1.5 h-4 w-4" />Export</Button></div></div>
    {filterOpen && <Card><CardContent className="p-4"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Select value={draftFilters.stage} onChange={(event) => setFilter('stage', event.target.value)}><option value="">Any stage</option>{PIPELINE_STAGES.map((stage) => <option key={stage.key} value={stage.key}>{stage.label}</option>)}</Select>
      <Select value={draftFilters.status} onChange={(event) => setFilter('status', event.target.value)}><option value="">Any status</option><option value="OPEN">Open</option><option value="WON">Won</option><option value="LOST">Lost</option></Select>
      <Select value={draftFilters.priority} onChange={(event) => setFilter('priority', event.target.value)}><option value="">Any priority</option>{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => <option key={priority}>{priority}</option>)}</Select>
      <Select value={draftFilters.assignedToId} onChange={(event) => setFilter('assignedToId', event.target.value)}><option value="">Any salesperson</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</Select>
      <Select value={draftFilters.customerId} onChange={(event) => setFilter('customerId', event.target.value)}><option value="">Any customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</Select>
      <div className="flex gap-2"><Input type="number" min="0" placeholder="Min value" value={draftFilters.minValue} onChange={(event) => setFilter('minValue', event.target.value)} /><Input type="number" min="0" placeholder="Max value" value={draftFilters.maxValue} onChange={(event) => setFilter('maxValue', event.target.value)} /></div>
      <div className="flex gap-2"><Input type="number" min="0" max="100" placeholder="Min probability" value={draftFilters.minProbability} onChange={(event) => setFilter('minProbability', event.target.value)} /><Input type="number" min="0" max="100" placeholder="Max probability" value={draftFilters.maxProbability} onChange={(event) => setFilter('maxProbability', event.target.value)} /></div>
      <label className="text-[11px] text-slate-500">Expected close from<Input type="date" value={draftFilters.closeFrom} onChange={(event) => setFilter('closeFrom', event.target.value)} /></label>
      <label className="text-[11px] text-slate-500">Expected close to<Input type="date" value={draftFilters.closeTo} onChange={(event) => setFilter('closeTo', event.target.value)} /></label>
      <label className="text-[11px] text-slate-500">Created from<Input type="date" value={draftFilters.createdFrom} onChange={(event) => setFilter('createdFrom', event.target.value)} /></label>
      <label className="text-[11px] text-slate-500">Created to<Input type="date" value={draftFilters.createdTo} onChange={(event) => setFilter('createdTo', event.target.value)} /></label>
    </div><div className="mt-3 flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => { setDraftFilters(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); }}>Clear filters</Button><Button size="sm" onClick={() => setFilters(draftFilters)}>Apply filters</Button></div></CardContent></Card>}

    {selectedIds.length > 0 && <div className="flex flex-col gap-2 rounded-lg border border-indigo-200 bg-indigo-50/70 p-3 dark:border-indigo-900 dark:bg-indigo-950/40 lg:flex-row lg:items-center"><span className="mr-auto text-sm font-semibold text-indigo-900 dark:text-indigo-200">{selectedIds.length} selected</span><Select value={bulkAssignee} onChange={(event) => setBulkAssignee(event.target.value)} className="lg:w-44"><option value="">Assign salesperson</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</Select><Button size="sm" variant="outline" disabled={!bulkAssignee} onClick={() => applyBulk({ assignedToId: bulkAssignee })}>Assign</Button><Select value={bulkStage} onChange={(event) => setBulkStage(event.target.value)} className="lg:w-40"><option value="">Change stage</option>{PIPELINE_STAGES.filter((stage) => !FINAL_STAGES.includes(stage.key)).map((stage) => <option key={stage.key} value={stage.key}>{stage.label}</option>)}</Select><Button size="sm" variant="outline" disabled={!bulkStage} onClick={() => applyBulk({ stage: bulkStage as DealStage, status: 'OPEN' })}>Move</Button><Select value={bulkPriority} onChange={(event) => setBulkPriority(event.target.value)} className="lg:w-36"><option value="">Change priority</option>{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => <option key={priority}>{priority}</option>)}</Select><Button size="sm" variant="outline" disabled={!bulkPriority} onClick={() => applyBulk({ priority: bulkPriority as Deal['priority'] })}>Update</Button><Select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)} className="lg:w-32"><option value="">Change status</option><option value="OPEN">Open</option><option value="WON">Won</option><option value="LOST">Lost</option></Select><Button size="sm" variant="outline" disabled={!bulkStatus} onClick={() => {
      if (bulkStatus === 'WON') {
        if (window.confirm(`Mark ${selectedIds.length} selected deals as Won?`)) applyBulk({ stage: 'WON', status: 'WON', probability: 100 });
      } else if (bulkStatus === 'LOST') {
        const reason = window.prompt('Loss reason (Price, Competitor, No Budget, Not Interested, Timing, Other)');
        if (reason && ['Price', 'Competitor', 'No Budget', 'Not Interested', 'Timing', 'Other'].includes(reason)) applyBulk({ stage: 'LOST', status: 'LOST', probability: 0, lossReason: reason, lossNotes: window.prompt('Additional loss notes') || '' });
      } else applyBulk({ status: 'OPEN' });
    }}>Set status</Button><Button size="sm" variant="outline" onClick={() => { if (window.confirm(`Delete ${selectedIds.length} selected deals?`)) { onDeleteDeals?.(selectedIds); setSelectedIds([]); } }}>Delete</Button><Button size="icon" variant="ghost" title="Clear selection" onClick={() => setSelectedIds([])}><X className="h-4 w-4" /></Button></div>}

    {deals.length === 0 ? <div className="rounded-lg border border-slate-200 bg-white px-4 py-12 text-center dark:border-slate-800 dark:bg-slate-900"><p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No deals in this pipeline</p><p className="mt-1 text-xs text-slate-400">Create a deal to start forecasting opportunities.</p><Button className="mt-3" size="sm" onClick={() => openCreateForm()}><Plus className="mr-1 h-4 w-4" />Create deal</Button></div> : filteredDeals.length === 0 ? <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">No deals match your search and filters.</div> : <>
      <div className="sm:hidden flex items-center gap-1 overflow-x-auto pb-1">{[{ key: 'ALL' as const, label: `All (${filteredDeals.length})` }, ...PIPELINE_STAGES.map((stage) => ({ key: stage.key, label: `${stage.label} (${filteredDeals.filter((deal) => deal.stage === stage.key).length})` }))].map((stage) => <button key={stage.key} onClick={() => setMobileActiveStage(stage.key)} className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-medium ${mobileActiveStage === stage.key ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'}`}>{stage.label}</button>)}</div>
      <div className="mb-2 flex items-center gap-2"><input aria-label="Select all deals" type="checkbox" checked={filteredDeals.length > 0 && selectedIds.length === filteredDeals.length} onChange={selectAll} /><span className="text-xs text-slate-500">Select all visible deals</span></div>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}><div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 md:grid md:grid-cols-3 2xl:grid-cols-6">{PIPELINE_STAGES.filter((stage) => mobileActiveStage === 'ALL' || mobileActiveStage === stage.key).map((stage) => {
        const stageDeals = filteredDeals.filter((deal) => deal.stage === stage.key);
        const aggregate = stageData.find((item) => item.key === stage.key)!;
        return <div key={stage.key} className="min-w-67.5 flex-1 snap-start md:min-w-0"><StageColumn stage={stage.key} label={stage.label} deals={stageDeals} users={users} customers={customers} totalValue={aggregate.value} weightedValue={aggregate.weighted} selectedIds={selectedIds} onToggleSelect={toggleSelected} onAddDeal={openCreateForm} onViewDeal={onViewDeal} onEditDeal={(deal) => { setEditingDeal(deal); setFormOpen(true); }} onMoveStage={(dealId, next) => { const deal = deals.find((item) => item.id === dealId); if (deal) requestStageChange(deal, next); }} /></div>;
      })}</div><DragOverlay>{activeDeal ? <DealCard deal={activeDeal} assignedUser={userById(activeDeal.assignedToId)} customer={customerById(activeDeal.customerId)} isOverlay /> : null}</DragOverlay></DndContext>
    </>}

    <DealForm open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingDeal(null); }} deal={editingDeal} defaultStage={defaultStage} customers={customers} users={users} onSubmit={(data) => editingDeal ? onSaveDeal?.(editingDeal.id, data) : onCreateDeal(data)} />
    <Dialog open={Boolean(pendingStage)} onOpenChange={(open) => { if (!open) setPendingStage(null); }}><DialogContent><DialogHeader onClose={() => setPendingStage(null)}><DialogTitle>{pendingStage?.stage === 'WON' ? 'Confirm won deal' : 'Close deal as lost'}</DialogTitle><DialogDescription>{pendingStage?.stage === 'WON' ? 'Confirm the customer and choose whether to hand this deal off for order creation.' : 'A loss reason is required to close this deal.'}</DialogDescription></DialogHeader>
      {pendingStage?.stage === 'WON' ? <div className="space-y-3"><p className="text-sm font-semibold text-slate-900 dark:text-white">{pendingStage.deal.title} · {formatCurrency(pendingStage.deal.value)}</p><label className="block space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">Confirm customer<Select value={wonCustomerId} onChange={(event) => setWonCustomerId(event.target.value)}><option value="">Select customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}{customer.company ? ` · ${customer.company}` : ''}</option>)}</Select></label><label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><input type="checkbox" checked={createOrder} onChange={(event) => setCreateOrder(event.target.checked)} />Create an order handoff from this deal</label></div> : <div className="space-y-3"><label className="block space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">Loss reason *<Select value={lossReason} onChange={(event) => setLossReason(event.target.value)}><option value="">Select a reason</option>{['Price', 'Competitor', 'No Budget', 'Not Interested', 'Timing', 'Other'].map((reason) => <option key={reason}>{reason}</option>)}</Select></label><label className="block space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">Additional notes<textarea value={lossNotes} onChange={(event) => setLossNotes(event.target.value)} rows={3} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" /></label></div>}
      <DialogFooter><Button variant="outline" onClick={() => setPendingStage(null)}>Cancel</Button><Button variant={pendingStage?.stage === 'LOST' ? 'destructive' : 'default'} disabled={pendingStage?.stage === 'LOST' ? !lossReason : !wonCustomerId} onClick={() => { if (!pendingStage) return; const change = pendingStage.stage === 'LOST' ? { lossReason, lossNotes } : { customerId: wonCustomerId }; onUpdateDealStage(pendingStage.deal.id, pendingStage.stage, change); if (pendingStage.stage === 'WON' && createOrder) onCreateOrderFromDeal?.({ ...pendingStage.deal, customerId: wonCustomerId }); setPendingStage(null); }}>{pendingStage?.stage === 'WON' ? 'Confirm won' : 'Mark lost'}</Button></DialogFooter>
    </DialogContent></Dialog>
  </div>;
}

export default SalesPipeline;
