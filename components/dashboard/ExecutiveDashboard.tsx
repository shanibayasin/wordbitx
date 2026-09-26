import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCheck,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  Filter,
  HandCoins,
  Landmark,
  Layers3,
  MessageSquareText,
  Phone,
  Plus,
  ReceiptText,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import { Badge } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card.tsx';
import { Select } from '../ui/Select.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table.tsx';
import { StatsCard } from './StatsCard.tsx';
import { RevenueChart } from './RevenueChart.tsx';
import { PipelineChart } from './PipelineChart.tsx';
import { formatCurrency } from '../../lib/utils.ts';

type RangeFilter = '7D' | '30D' | '3M' | '6M' | '1Y';

interface DashboardFilterState {
  range: RangeFilter;
  team: string;
  salesperson: string;
  dealer: string;
  pipeline: string;
  status: string;
}

const baseRevenueData = [
  { month: 'Jan', revenue: 54000, dealsWon: 5 },
  { month: 'Feb', revenue: 62000, dealsWon: 6 },
  { month: 'Mar', revenue: 71500, dealsWon: 7 },
  { month: 'Apr', revenue: 68000, dealsWon: 6 },
  { month: 'May', revenue: 82000, dealsWon: 8 },
  { month: 'Jun', revenue: 91000, dealsWon: 9 },
  { month: 'Jul', revenue: 106000, dealsWon: 10 },
  { month: 'Aug', revenue: 118000, dealsWon: 11 },
  { month: 'Sep', revenue: 134000, dealsWon: 13 },
  { month: 'Oct', revenue: 148000, dealsWon: 15 },
  { month: 'Nov', revenue: 160000, dealsWon: 16 },
  { month: 'Dec', revenue: 176000, dealsWon: 18 },
];

const salesFunnelData = [
  { stage: 'Lead', count: 260, value: 268000, conversion: 100 },
  { stage: 'Qualified', count: 168, value: 214000, conversion: 64.6 },
  { stage: 'Proposal', count: 116, value: 188500, conversion: 44.6 },
  { stage: 'Negotiation', count: 74, value: 146000, conversion: 28.5 },
  { stage: 'Won', count: 41, value: 129000, conversion: 15.8 },
  { stage: 'Lost', count: 18, value: 38000, conversion: 6.9 },
];

const orderOverviewData = [
  { label: 'Completed', value: 434, color: '#4f46e5' },
  { label: 'Processing', value: 138, color: '#3b82f6' },
  { label: 'Pending', value: 92, color: '#f59e0b' },
  { label: 'Cancelled', value: 27, color: '#ef4444' },
];

const paymentOverviewData = [
  { label: 'Paid', value: 285000, color: '#10b981' },
  { label: 'Pending', value: 84000, color: '#f59e0b' },
  { label: 'Partial', value: 27000, color: '#6366f1' },
  { label: 'Overdue', value: 42000, color: '#ef4444' },
];

const dealerPerformanceData = [
  { dealer: 'NorthPeak Distribution', leads: 48, deals: 16, orders: 23, revenue: 210000, commission: 18200 },
  { dealer: 'SummitWorks', leads: 41, deals: 14, orders: 19, revenue: 186500, commission: 16380 },
  { dealer: 'Silverline Retail', leads: 36, deals: 12, orders: 17, revenue: 172000, commission: 15100 },
  { dealer: 'Harbor Trade Group', leads: 29, deals: 10, orders: 15, revenue: 148500, commission: 12850 },
  { dealer: 'BlueStone Partners', leads: 24, deals: 9, orders: 12, revenue: 131200, commission: 11680 },
];

const recentOrders = [
  { id: 'ORD-1048', customer: 'Atlas Labs', dealer: 'NorthPeak', amount: 18500, payment: 'Paid', status: 'Completed', date: '2026-09-20' },
  { id: 'ORD-1047', customer: 'Greenfield Works', dealer: 'SummitWorks', amount: 24200, payment: 'Pending', status: 'Processing', date: '2026-09-18' },
  { id: 'ORD-1046', customer: 'Crestview Health', dealer: 'BlueStone', amount: 12650, payment: 'Partial', status: 'Shipped', date: '2026-09-15' },
  { id: 'ORD-1045', customer: 'Nova Systems', dealer: 'Harbor Trade', amount: 30200, payment: 'Paid', status: 'Completed', date: '2026-09-12' },
  { id: 'ORD-1044', customer: 'Aster Frame', dealer: 'Silverline', amount: 9800, payment: 'Overdue', status: 'Pending', date: '2026-09-09' },
];

const recentActivities = [
  { type: 'lead', title: 'New lead created', entity: 'Apex Health', user: 'Maya Chen', time: '8 mins ago' },
  { type: 'deal', title: 'Deal updated', entity: 'NorthPeak Renewal', user: 'Oliver Grant', time: '21 mins ago' },
  { type: 'order', title: 'Order created', entity: 'ORD-1048', user: 'Ella Brooks', time: '1 hour ago' },
  { type: 'payment', title: 'Payment received', entity: 'Invoice INV-2991', user: 'Noah Patel', time: '2 hours ago' },
  { type: 'ticket', title: 'Ticket created', entity: 'Support #8842', user: 'Ava Reed', time: '4 hours ago' },
  { type: 'task', title: 'Task completed', entity: 'Quarterly review', user: 'Lucas Kim', time: 'Today' },
  { type: 'customer', title: 'Customer added', entity: 'SummitWorks', user: 'Priya Shah', time: 'Yesterday' },
];

const upcomingFollowUps = [
  { type: 'Call', customer: 'Atlas Labs', assignedTo: 'Maya Chen', date: 'Today, 11:30 AM', priority: 'High', status: 'Scheduled' },
  { type: 'Customer follow-up', customer: 'Nova Systems', assignedTo: 'Oliver Grant', date: 'Today, 2:15 PM', priority: 'Medium', status: 'Pending' },
  { type: 'Meeting', customer: 'Greenfield Works', assignedTo: 'Priya Shah', date: 'Tomorrow, 9:00 AM', priority: 'High', status: 'Confirmed' },
  { type: 'Task', customer: 'Aster Frame', assignedTo: 'Ella Brooks', date: 'Tomorrow, 4:45 PM', priority: 'Low', status: 'In progress' },
];

const quickActions = [
  { label: 'New Lead', icon: Users, accent: 'bg-indigo-50 text-indigo-700' },
  { label: 'New Customer', icon: Building2, accent: 'bg-sky-50 text-sky-700' },
  { label: 'New Dealer', icon: Landmark, accent: 'bg-violet-50 text-violet-700' },
  { label: 'New Deal', icon: BriefcaseBusiness, accent: 'bg-emerald-50 text-emerald-700' },
  { label: 'New Order', icon: ReceiptText, accent: 'bg-amber-50 text-amber-700' },
  { label: 'New Invoice', icon: FileText, accent: 'bg-rose-50 text-rose-700' },
  { label: 'Record Payment', icon: Wallet, accent: 'bg-cyan-50 text-cyan-700' },
  { label: 'New Ticket', icon: MessageSquareText, accent: 'bg-fuchsia-50 text-fuchsia-700' },
];

const defaultFilters: DashboardFilterState = {
  range: '30D',
  team: 'All Teams',
  salesperson: 'All Salespeople',
  dealer: 'All Dealers',
  pipeline: 'All Pipelines',
  status: 'All Statuses',
};

const rangeScale: Record<RangeFilter, number> = {
  '7D': 0.68,
  '30D': 1,
  '3M': 1.34,
  '6M': 1.68,
  '1Y': 2.15,
};

const activityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  lead: Users,
  deal: Target,
  order: ReceiptText,
  payment: CreditCard,
  ticket: MessageSquareText,
  task: CheckCheck,
  customer: Building2,
};

function getBadgeVariant(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('paid') || normalized.includes('completed') || normalized.includes('won') || normalized.includes('confirmed')) {
    return 'success';
  }
  if (normalized.includes('pending') || normalized.includes('processing') || normalized.includes('scheduled')) {
    return 'warning';
  }
  if (normalized.includes('cancel') || normalized.includes('overdue') || normalized.includes('lost')) {
    return 'destructive';
  }
  return 'secondary';
}

function buildKpiData(filters: DashboardFilterState) {
  const scale = rangeScale[filters.range];
  const productFactor = filters.team === 'Enterprise' ? 1.18 : filters.team === 'Mid-Market' ? 1.08 : 1;
  const repFactor = filters.salesperson === 'All Salespeople' ? 1 : 0.94;
  const dealerFactor = filters.dealer === 'All Dealers' ? 1 : 0.88;

  return [
    {
      title: 'Total Revenue',
      value: formatCurrency(Math.round(176000 * scale * productFactor * repFactor)),
      change: 18.4,
      changeLabel: 'vs previous period',
      icon: CircleDollarSign,
      colorVariant: 'emerald' as const,
    },
    {
      title: 'Active Leads',
      value: Math.round(243 * scale * dealerFactor),
      change: 12.7,
      changeLabel: 'vs last month',
      icon: Users,
      colorVariant: 'indigo' as const,
    },
    {
      title: 'Open Pipeline Value',
      value: formatCurrency(Math.round(1285000 * scale * 0.72)),
      change: 9.2,
      changeLabel: 'vs previous period',
      icon: Layers3,
      colorVariant: 'purple' as const,
    },
    {
      title: 'Active Deals',
      value: Math.round(47 * productFactor),
      change: 6.8,
      changeLabel: 'vs last month',
      icon: BriefcaseBusiness,
      colorVariant: 'amber' as const,
    },
    {
      title: 'Total Orders',
      value: Math.round(691 * scale),
      change: 14.5,
      changeLabel: 'vs previous period',
      icon: ReceiptText,
      colorVariant: 'sky' as const,
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(Math.round(142000 * scale * 0.8)),
      change: -4.6,
      changeLabel: 'vs previous period',
      icon: CreditCard,
      colorVariant: 'rose' as const,
    },
    {
      title: 'Active Support Tickets',
      value: Math.round(26 * scale),
      change: -2.1,
      changeLabel: 'resolution pace',
      icon: MessageSquareText,
      colorVariant: 'amber' as const,
    },
    {
      title: 'Tasks Due Today',
      value: Math.round(12 * scale),
      change: 8.3,
      changeLabel: 'completion rate',
      icon: CalendarClock,
      colorVariant: 'violet' as const,
    },
  ];
}

function DashboardFilters({
  filters,
  onChange,
}: {
  filters: DashboardFilterState;
  onChange: (key: keyof DashboardFilterState, value: string) => void;
}) {
  const filterGroups = [
    { key: 'range' as const, label: 'Date Range', value: filters.range, options: ['7D', '30D', '3M', '6M', '1Y'] },
    { key: 'team' as const, label: 'Team', value: filters.team, options: ['All Teams', 'Enterprise', 'Mid-Market', 'SMB'] },
    { key: 'salesperson' as const, label: 'Salesperson', value: filters.salesperson, options: ['All Salespeople', 'Maya Chen', 'Oliver Grant', 'Priya Shah', 'Ella Brooks'] },
    { key: 'dealer' as const, label: 'Dealer', value: filters.dealer, options: ['All Dealers', 'NorthPeak Distribution', 'SummitWorks', 'Silverline Retail', 'BlueStone Partners'] },
    { key: 'pipeline' as const, label: 'Pipeline', value: filters.pipeline, options: ['All Pipelines', 'Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won'] },
    { key: 'status' as const, label: 'Status', value: filters.status, options: ['All Statuses', 'Completed', 'Processing', 'Pending', 'Cancelled'] },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold">Dashboard Filters</CardTitle>
            <CardDescription>Scope the performance overview across the business.</CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            <Filter className="h-3.5 w-3.5" />
            Live View
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filterGroups.map((group) => (
            <label key={group.key} className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                {group.label}
              </span>
              <Select value={group.value} onChange={(event) => onChange(group.key, event.target.value)} className="min-w-0">
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardKPICards() {
  const [filters, setFilters] = useState<DashboardFilterState>(defaultFilters);
  const kpis = useMemo(() => buildKpiData(filters), [filters]);

  return (
    <>
      <DashboardFilters
        filters={filters}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((item) => (
          <StatsCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            change={item.change}
            changeLabel={item.changeLabel}
            colorVariant={item.colorVariant}
          />
        ))}
      </div>
    </>
  );
}

function SalesFunnel() {
  const maxCount = Math.max(...salesFunnelData.map((item) => item.count));

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold">Sales Funnel</CardTitle>
            <CardDescription>Lead-to-close performance and pipeline conversion.</CardDescription>
          </div>
          <Badge variant="secondary" className="px-2.5 py-1 text-[10px] font-semibold">
            Win rate 15.8%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {salesFunnelData.map((stage) => (
          <div key={stage.stage} className="grid grid-cols-[110px_minmax(0,1fr)_90px] items-center gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              {stage.stage}
            </div>
            <div className="relative h-9 overflow-hidden rounded-full bg-slate-100">
              <div
                className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 px-3 text-[10px] font-semibold text-white"
                style={{ width: `${(stage.count / maxCount) * 100}%` }}
              >
                {stage.conversion}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900">{stage.count}</div>
              <div className="text-[10px] text-slate-500">{formatCurrency(stage.value)}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function OrderOverview() {
  const total = orderOverviewData.reduce((sum, item) => sum + item.value, 0);
  const gradient = orderOverviewData.reduce<string[]>((parts, item, index) => {
    const previousValue = orderOverviewData.slice(0, index).reduce((sum, current) => sum + current.value, 0);
    const start = (previousValue / total) * 100;
    const end = ((previousValue + item.value) / total) * 100;
    parts.push(`${item.color} ${start}% ${end}%`);
    return parts;
  }, []).join(', ');

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Order Overview</CardTitle>
        <CardDescription>Order mix across fulfillment and completion states.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div
            className="h-32 w-32 rounded-full"
            style={{ background: `conic-gradient(${gradient})` }}
          />
          <div className="w-full space-y-2">
            {orderOverviewData.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                  <span className="text-[10px] text-slate-400">
                    {((item.value / total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentOverview() {
  const total = paymentOverviewData.reduce((sum, item) => sum + item.value, 0);
  const gradient = paymentOverviewData.reduce<string[]>((parts, item, index) => {
    const previousValue = paymentOverviewData.slice(0, index).reduce((sum, current) => sum + current.value, 0);
    const start = (previousValue / total) * 100;
    const end = ((previousValue + item.value) / total) * 100;
    parts.push(`${item.color} ${start}% ${end}%`);
    return parts;
  }, []).join(', ');

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Payment Overview</CardTitle>
        <CardDescription>Cash collection and outstanding receivables status.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div
            className="h-32 w-32 rounded-full"
            style={{ background: `conic-gradient(${gradient})` }}
          />
          <div className="w-full space-y-2">
            {paymentOverviewData.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.value)}</span>
                  <span className="text-[10px] text-slate-400">
                    {((item.value / total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DealerPerformance() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold">Dealer Performance</CardTitle>
            <CardDescription>Channel performance by lead generation and revenue contribution.</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            View report
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dealer</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Deals</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dealerPerformanceData.map((dealer) => (
                <TableRow key={dealer.dealer}>
                  <TableCell className="font-medium text-slate-900">{dealer.dealer}</TableCell>
                  <TableCell className="text-right">{dealer.leads}</TableCell>
                  <TableCell className="text-right">{dealer.deals}</TableCell>
                  <TableCell className="text-right">{dealer.orders}</TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">{formatCurrency(dealer.revenue)}</TableCell>
                  <TableCell className="text-right font-semibold text-emerald-600">{formatCurrency(dealer.commission)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentOrders() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold">Recent Orders</CardTitle>
            <CardDescription>Latest customer and partner transactions.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
            View All Orders
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Dealer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-slate-900">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.dealer}</TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">{formatCurrency(order.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(order.payment)}>{order.payment}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivities() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Recent Activities</CardTitle>
        <CardDescription>Latest operational changes across the CRM.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = activityIconMap[activity.type] || Sparkles;
            return (
              <div key={`${activity.type}-${activity.entity}`} className="relative flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="mt-1 h-full w-px bg-slate-200" />
                </div>
                <div className="min-w-0 flex-1 pb-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                    <span className="text-[11px] font-medium text-slate-400">{activity.time}</span>
                  </div>
                  <p className="text-sm text-slate-600">{activity.entity}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>{activity.user}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingFollowUps() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Upcoming Follow-Ups</CardTitle>
        <CardDescription>Key sales and service actions scheduled this cycle.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {upcomingFollowUps.map((item) => (
          <div key={`${item.customer}-${item.date}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.customer}</p>
                <p className="mt-1 text-xs text-slate-500">{item.type}</p>
              </div>
              <Badge variant={getBadgeVariant(item.priority)} className="px-2.5 py-0.5 text-[10px] uppercase">
                {item.priority}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {item.assignedTo}</span>
              <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> {item.date}</span>
              <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {item.status}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
        <CardDescription>Day-to-day revenue operations at a glance.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button key={action.label} variant="outline" className="h-auto flex-col gap-2 px-3 py-3 text-center">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.accent}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-medium text-slate-700">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function ExecutiveDashboard() {
  const [filters, setFilters] = useState<DashboardFilterState>(defaultFilters);

  const filteredRevenueData = useMemo(() => {
    const scale = rangeScale[filters.range];
    const filtered = baseRevenueData.map((entry, index) => {
      const variance = index % 2 === 0 ? 1.12 : 0.94;
      return {
        ...entry,
        revenue: Math.round(entry.revenue * scale * variance),
      };
    });

    if (filters.team === 'SMB') {
      return filtered.map((entry) => ({ ...entry, revenue: Math.round(entry.revenue * 0.8) }));
    }
    if (filters.team === 'Enterprise') {
      return filtered.map((entry) => ({ ...entry, revenue: Math.round(entry.revenue * 1.18) }));
    }

    return filtered;
  }, [filters.range, filters.team]);

  const currentMonth = filteredRevenueData[filteredRevenueData.length - 1];
  const previousMonth = filteredRevenueData[filteredRevenueData.length - 2] || filteredRevenueData[filteredRevenueData.length - 1];
  const revenueGrowth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Executive Revenue Overview</h1>
          <p className="text-sm text-slate-500">
            Real-time pipeline analytics, revenue planning, and commercial performance across the operating unit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500" />
            Live Synchronised
          </span>
        </div>
      </div>

      <DashboardFilters
        filters={filters}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {buildKpiData(filters).map((item) => (
          <StatsCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            change={item.change}
            changeLabel={item.changeLabel}
            colorVariant={item.colorVariant}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
        <RevenueChart
          data={filteredRevenueData}
          rangeLabel={filters.range}
          currentMonth={currentMonth.month}
          growth={revenueGrowth}
        />
        <PipelineChart data={salesFunnelData.map((stage) => ({ stage: stage.stage.toUpperCase() as any, count: stage.count, totalValue: stage.value }))} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SalesFunnel />
        <OrderOverview />
        <PaymentOverview />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
        <DealerPerformance />
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <RecentOrders />
        <RecentActivities />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <UpcomingFollowUps />
      </div>
    </div>
  );
}
