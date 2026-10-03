'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '../components/layout/Sidebar.tsx';
import { Topbar } from '../components/layout/Topbar.tsx';
import { MobileNav } from '../components/layout/MobileNav.tsx';
import { Toaster, toast } from '../components/ui/Sonner.tsx';
import { StatsCard } from '../components/dashboard/StatsCard.tsx';
import { RevenueChart } from '../components/dashboard/RevenueChart.tsx';
import { PipelineChart } from '../components/dashboard/PipelineChart.tsx';
import { LeadTable } from '../components/leads/LeadTable.tsx';
import { LeadForm } from '../components/leads/LeadForm.tsx';
import { SalesPipeline } from '../components/pipeline/SalesPipeline.tsx';
import { DealDetails } from '../components/pipeline/DealDetails.tsx';
import { OrderWorkspace } from '../components/orders/OrderWorkspace.tsx';
import { CustomerTable } from '../components/customers/CustomerTable.tsx';
import { CustomerForm } from '../components/customers/CustomerForm.tsx';
import { CustomerDetails } from '../components/customers/CustomerDetails.tsx';
import { TicketTable } from '../components/tickets/TicketTable.tsx';
import { TicketForm } from '../components/tickets/TicketForm.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Select } from '../components/ui/Select.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/Dialog.tsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table.tsx';
import {
  Users,
  DollarSign,
  LifeBuoy,
  CheckSquare,
  Kanban,
  Building,
  UserCheck,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Mail,
  Phone,
  ArrowLeft,
  ExternalLink,
  Shield,
  Clock,
  UserPlus,
  TrendingUp,
  Award,
  Target,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils.ts';
import {
  User,
  Organization,
  Lead,
  Deal,
  Customer,
  Ticket,
  Task,
  DealStage,
  Order,
  Role,
} from '../types/index.ts';

// Initial Multi-Tenant Seed Data
const SEED_ORGS: Organization[] = [
  { id: 'org_acme', name: 'Acme Technologies Inc.', createdAt: new Date() },
  { id: 'org_apex', name: 'Apex Global Software', createdAt: new Date() },
];

const SEED_USERS: User[] = [
  { id: 'usr_1', name: 'Sarah Jenkins', email: 'sarah.jenkins@acme.io', role: 'ADMIN', organizationId: 'org_acme', createdAt: new Date() },
  { id: 'usr_2', name: 'Marcus Wright', email: 'marcus.wright@acme.io', role: 'SALES', organizationId: 'org_acme', createdAt: new Date() },
  { id: 'usr_3', name: 'Elena Rostova', email: 'elena.rostova@acme.io', role: 'SALES', organizationId: 'org_acme', createdAt: new Date() },
  { id: 'usr_4', name: 'Devon Vance', email: 'devon.vance@acme.io', role: 'SUPPORT', organizationId: 'org_acme', createdAt: new Date() },
  { id: 'usr_5', name: 'Claire Zhao', email: 'claire.zhao@acme.io', role: 'AGENT', organizationId: 'org_acme', createdAt: new Date() },
];

const SEED_LEADS: Lead[] = [
  { id: 'lead_1', name: 'Alex Morgan', email: 'alex.morgan@fintechcorp.com', phone: '+1 (555) 234-8901', source: 'LinkedIn InMail', score: 85, status: 'QUALIFIED', organizationId: 'org_acme', assignedToId: 'usr_2', createdAt: new Date(Date.now() - 86400000 * 2), updatedAt: new Date() },
  { id: 'lead_2', name: 'Samantha Vance', email: 'svance@aerodynamics.io', phone: '+1 (555) 891-2304', source: 'Website Form', score: 62, status: 'NEW', organizationId: 'org_acme', assignedToId: 'usr_3', createdAt: new Date(Date.now() - 86400000 * 4), updatedAt: new Date() },
  { id: 'lead_3', name: 'Liam Chen', email: 'lchen@biolabs.tech', phone: '+1 (555) 432-1920', source: 'Industry Conference', score: 92, status: 'FOLLOW_UP', organizationId: 'org_acme', assignedToId: 'usr_2', createdAt: new Date(Date.now() - 86400000 * 6), updatedAt: new Date() },
  { id: 'lead_4', name: 'Chloe Dubois', email: 'cdubois@parisconsult.eu', phone: '+33 1 42 68 55 00', source: 'Client Referral', score: 74, status: 'QUALIFIED', organizationId: 'org_acme', assignedToId: 'usr_1', createdAt: new Date(Date.now() - 86400000 * 9), updatedAt: new Date() },
  { id: 'lead_5', name: 'David Miller', email: 'david@constructo.com', phone: '+1 (555) 321-7788', source: 'Cold Outbound', score: 35, status: 'LOST', organizationId: 'org_acme', assignedToId: 'usr_3', createdAt: new Date(Date.now() - 86400000 * 15), updatedAt: new Date() },
];

const SEED_CUSTOMERS: Customer[] = [
  { id: 'cust_1', name: 'Jordan Lee', company: 'Apex Global Solutions', email: 'jordan@apex.io', phone: '+1 (555) 901-2244', organizationId: 'org_acme', createdAt: new Date(Date.now() - 86400000 * 60) },
  { id: 'cust_2', name: 'Maya Patel', company: 'CloudScale Networks', email: 'maya@cloudscale.net', phone: '+1 (555) 882-3901', organizationId: 'org_acme', createdAt: new Date(Date.now() - 86400000 * 90) },
  { id: 'cust_3', name: 'Derek Thorne', company: 'Fintech Hub Corp', email: 'derek@fintechhub.com', phone: '+1 (555) 334-1100', organizationId: 'org_acme', createdAt: new Date(Date.now() - 86400000 * 40) },
  { id: 'cust_4', name: 'Sophia Sterling', company: 'Global Logistics Corp', email: 'sophia@globallogistics.com', phone: '+1 (555) 777-9911', organizationId: 'org_acme', createdAt: new Date(Date.now() - 86400000 * 120) },
];

const SEED_DEALS: Deal[] = [
  { id: 'deal_1', title: 'Apex AI Platform Annual License', value: 85000, stage: 'NEGOTIATION', probability: 75, organizationId: 'org_acme', customerId: 'cust_1', assignedToId: 'usr_1', createdAt: new Date(Date.now() - 86400000 * 5), updatedAt: new Date() },
  { id: 'deal_2', title: 'Global Fintech Infrastructure Expansion', value: 120000, stage: 'PROPOSAL', probability: 60, organizationId: 'org_acme', customerId: 'cust_3', assignedToId: 'usr_2', createdAt: new Date(Date.now() - 86400000 * 8), updatedAt: new Date() },
  { id: 'deal_3', title: 'Cloud Data Migration & Security Suite', value: 45000, stage: 'WON', probability: 100, organizationId: 'org_acme', customerId: 'cust_2', assignedToId: 'usr_3', createdAt: new Date(Date.now() - 86400000 * 12), updatedAt: new Date() },
  { id: 'deal_4', title: 'Kubernetes Observability Enterprise Tier', value: 38000, stage: 'QUALIFIED', probability: 40, organizationId: 'org_acme', customerId: 'cust_2', assignedToId: 'usr_2', createdAt: new Date(Date.now() - 86400000 * 2), updatedAt: new Date() },
  { id: 'deal_5', title: 'Legacy Monolith Modernization Pilot', value: 25000, stage: 'LOST', probability: 0, organizationId: 'org_acme', customerId: 'cust_1', assignedToId: 'usr_3', createdAt: new Date(Date.now() - 86400000 * 20), updatedAt: new Date() },
];

const SEED_TICKETS: Ticket[] = [
  { id: 't_1', subject: 'SSO SAML authentication intermittent failure', description: 'After IdP certificate rotation, approximately 5% of enterprise SSO logins fail with signature invalid.', status: 'OPEN', priority: 'URGENT', organizationId: 'org_acme', customerId: 'cust_1', assignedToId: 'usr_4', createdAt: new Date(Date.now() - 86400000 * 1), updatedAt: new Date() },
  { id: 't_2', subject: 'Webhook payload rate limit increase request', description: 'Client requested raising API burst limits from 500 req/min to 2,000 req/min during peak seasonal traffic.', status: 'IN_PROGRESS', priority: 'HIGH', organizationId: 'org_acme', customerId: 'cust_2', assignedToId: 'usr_4', createdAt: new Date(Date.now() - 86400000 * 2), updatedAt: new Date() },
  { id: 't_3', subject: 'Billing cycle prorated invoice discrepancy', description: 'Inquiry regarding additional seat cost added mid-month on invoice #INV-9281.', status: 'RESOLVED', priority: 'MEDIUM', organizationId: 'org_acme', customerId: 'cust_3', assignedToId: 'usr_1', createdAt: new Date(Date.now() - 86400000 * 5), updatedAt: new Date() },
  { id: 't_4', subject: 'CSV Export encoding issue on UTF-8 special characters', description: 'Accented characters exported into Excel spreadsheet have encoding garble.', status: 'WAITING', priority: 'LOW', organizationId: 'org_acme', customerId: 'cust_1', assignedToId: 'usr_4', createdAt: new Date(Date.now() - 86400000 * 7), updatedAt: new Date() },
];

const SEED_TASKS: Task[] = [
  { id: 'task_1', title: 'Schedule Q4 contract renewal discussion with Jordan (Apex Global)', dueDate: new Date(Date.now() + 86400000 * 2), completed: false, organizationId: 'org_acme', assignedToId: 'usr_1', createdAt: new Date() },
  { id: 'task_2', title: 'Send updated MSA pricing proposal to Maya at CloudScale Networks', dueDate: new Date(Date.now() + 86400000 * 1), completed: false, organizationId: 'org_acme', assignedToId: 'usr_2', createdAt: new Date() },
  { id: 'task_3', title: 'Review IdP certificate configuration with DevOps security team', dueDate: new Date(), completed: true, organizationId: 'org_acme', assignedToId: 'usr_4', createdAt: new Date() },
  { id: 'task_4', title: 'Compile monthly revenue cohort analytics for executive board', dueDate: new Date(Date.now() + 86400000 * 4), completed: false, organizationId: 'org_acme', assignedToId: 'usr_1', createdAt: new Date() },
];

export default function App() {
  const pathname = usePathname();
  const router = useRouter();
  const activeView = pathname.match(/^\/(leads|deals|customers|orders|tickets)\/[^/]+$/)
    ? pathname.startsWith('/leads/') ? '/leads/detail'
      : pathname.startsWith('/deals/') ? '/deals/detail'
        : pathname.startsWith('/customers/') ? '/customers/detail'
          : pathname.startsWith('/orders/') ? '/orders/detail'
            : '/tickets/detail'
    : pathname;
  const routeParam = activeView.endsWith('/detail') ? pathname.split('/').pop() || null : null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Multi-Tenancy State
  const [organizations, setOrganizations] = useState<Organization[]>(SEED_ORGS);
  const [currentOrgId, setCurrentOrgId] = useState('org_acme');

  // Core Data Collections (Scoping by Organization)
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [deals, setDeals] = useState<Deal[]>(SEED_DEALS);
  const [customers, setCustomers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [tickets, setTickets] = useState<Ticket[]>(SEED_TICKETS);
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasRestoredLocalData, setHasRestoredLocalData] = useState(false);

  // Modals State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketCustomerId, setTicketCustomerId] = useState('');

  const [isInviteTeamOpen, setIsInviteTeamOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('SALES');

  // New task input state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Authentication State
  const currentOrg = organizations.find((o) => o.id === currentOrgId) || organizations[0];
  const currentUser: User = users.find((u) => u.organizationId === currentOrgId) || users[0];

  // Filter scoped data by current logged-in organization
  const scopedLeads = leads.filter((l) => l.organizationId === currentOrgId);
  const scopedDeals = deals.filter((d) => d.organizationId === currentOrgId);
  const scopedCustomers = customers.filter((c) => c.organizationId === currentOrgId);
  const scopedTickets = tickets.filter((t) => t.organizationId === currentOrgId);
  const scopedTasks = tasks.filter((t) => t.organizationId === currentOrgId);
  const scopedOrders = orders.filter((order) => order.organizationId === currentOrgId);
  const scopedUsers = users.filter((u) => u.organizationId === currentOrgId);

  useEffect(() => {
    const restore = <T,>(key: string, fallback: T): T => {
      const stored = window.localStorage.getItem(key);
      if (!stored) return fallback;
      try {
        return JSON.parse(stored) as T;
      } catch (error) {
        console.error(`Unable to restore ${key} from local storage`, error);
        return fallback;
      }
    };

    setCustomers(restore<Customer[]>('wordbitx:customers', SEED_CUSTOMERS));
    setDeals(restore<Deal[]>('wordbitx:deals', SEED_DEALS));
    setOrders(restore<Order[]>('wordbitx:orders', []));
    setHasRestoredLocalData(true);
  }, []);

  useEffect(() => {
    if (!hasRestoredLocalData) return;
    window.localStorage.setItem('wordbitx:customers', JSON.stringify(customers));
  }, [customers, hasRestoredLocalData]);

  useEffect(() => {
    if (!hasRestoredLocalData) return;
    window.localStorage.setItem('wordbitx:deals', JSON.stringify(deals));
  }, [deals, hasRestoredLocalData]);

  useEffect(() => {
    if (!hasRestoredLocalData) return;
    window.localStorage.setItem('wordbitx:orders', JSON.stringify(orders));
  }, [orders, hasRestoredLocalData]);

  // Navigate helper
  const navigate = (path: string, param?: string) => {
    const targetPath = path.endsWith('/detail') && param
      ? `${path.slice(0, -'/detail'.length)}/${encodeURIComponent(param)}`
      : path;
    router.push(targetPath);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch organization helper
  const handleSwitchOrg = (orgId: string) => {
    setCurrentOrgId(orgId);
    const org = organizations.find((o) => o.id === orgId);
    toast.info(`Switched tenant workspace to: ${org?.name || orgId}`);
  };

  // --- CRUD Handlers ---

  // Leads
  const handleSaveLead = async (data: any) => {
    if (selectedLead) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === selectedLead.id ? { ...l, ...data, updatedAt: new Date() } : l
        )
      );
      toast.success('Lead updated successfully');
    } else {
      const newLead: Lead = {
        id: `lead_${Date.now()}`,
        ...data,
        organizationId: currentOrgId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLeads((prev) => [newLead, ...prev]);
      toast.success('New lead captured into pipeline');
    }
    setIsLeadModalOpen(false);
  };

  const handleDeleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    toast.success('Lead removed from repository');
  };

  // Deals
  const handleUpdateDealStage = (dealId: string, newStage: DealStage, change?: { lossReason?: string; lossNotes?: string; customerId?: string | null }) => {
    const changedAt = new Date();
    const deal = scopedDeals.find((item) => item.id === dealId);
    if (!deal || deal.stage === newStage) return;
    const stageHistory = {
      id: `stage_${Date.now()}`,
      fromStage: deal.stage,
      toStage: newStage,
      changedBy: currentUser.name,
      changedAt,
      timeInPreviousStageMs: Math.max(0, changedAt.getTime() - new Date(deal.stageEnteredAt || deal.updatedAt || deal.createdAt).getTime()),
      lossReason: change?.lossReason || null,
      lossNotes: change?.lossNotes || null,
    };
    const activity = {
      id: `activity_${Date.now()}`,
      type: newStage === 'WON' ? 'WON' as const : newStage === 'LOST' ? 'LOST' as const : 'STAGE_CHANGED' as const,
      description: newStage === 'LOST'
        ? `Deal marked lost: ${change?.lossReason || 'Reason not provided'}`
        : newStage === 'WON' ? 'Deal marked won' : `Stage changed from ${deal.stage} to ${newStage}`,
      user: currentUser.name,
      relatedEntity: 'Stage',
      createdAt: changedAt,
    };
    setDeals((prev) => prev.map((item) => item.id === dealId ? {
      ...item,
      ...change,
      stage: newStage,
      status: newStage === 'WON' ? 'WON' : newStage === 'LOST' ? 'LOST' : 'OPEN',
      probability: newStage === 'WON' ? 100 : newStage === 'LOST' ? 0 : item.probability,
      stageEnteredAt: changedAt,
      stageHistory: [...(item.stageHistory || []), stageHistory],
      activities: [activity, ...(item.activities || [])],
      updatedAt: changedAt,
      lastActivityAt: changedAt,
    } : item));
    toast.success(`Deal moved to stage: ${newStage}`);
  };

  const handleCreateDeal = (data: any) => {
    const createdAt = new Date();
    const newDeal: Deal = {
      id: `deal_${Date.now()}`,
      ...data,
      company: data.company || scopedCustomers.find((customer) => customer.id === data.customerId)?.company || null,
      organizationId: currentOrgId,
      createdAt,
      updatedAt: createdAt,
      stageEnteredAt: createdAt,
      lastActivityAt: createdAt,
      status: data.stage === 'WON' ? 'WON' : data.stage === 'LOST' ? 'LOST' : 'OPEN',
      stageHistory: [{ id: `stage_${Date.now()}`, fromStage: null, toStage: data.stage, changedBy: currentUser.name, changedAt: createdAt, timeInPreviousStageMs: 0 }],
      activities: [{ id: `activity_${Date.now()}`, type: 'CREATED', description: 'Deal created', user: currentUser.name, relatedEntity: 'Deal', createdAt }],
    };
    setDeals((prev) => [newDeal, ...prev]);
    toast.success('Opportunity created in pipeline');
  };

  const handleSaveDeal = async (dealId: string, data: any) => {
    const existing = scopedDeals.find((deal) => deal.id === dealId);
    if (!existing) return;
    const updatedAt = new Date();
    const events = [];
    if (existing.value !== data.value) events.push({ type: 'VALUE_CHANGED' as const, description: `Deal value changed from ${formatCurrency(existing.value)} to ${formatCurrency(data.value)}` });
    if (existing.probability !== data.probability) events.push({ type: 'PROBABILITY_CHANGED' as const, description: `Probability changed from ${existing.probability}% to ${data.probability}%` });
    if (existing.customerId !== data.customerId) events.push({ type: 'CUSTOMER_CHANGED' as const, description: 'Deal customer updated' });
    if (existing.stage !== data.stage) events.push({ type: 'STAGE_CHANGED' as const, description: `Stage changed from ${existing.stage} to ${data.stage}` });
    if (!events.length) events.push({ type: 'UPDATED' as const, description: 'Deal details updated' });
    const activities = events.map((event, index) => ({ id: `activity_${Date.now()}_${index}`, ...event, user: currentUser.name, relatedEntity: event.type === 'CUSTOMER_CHANGED' ? 'Customer' : 'Deal', createdAt: updatedAt }));
    const stageHistory = existing.stage !== data.stage ? {
      id: `stage_${Date.now()}`,
      fromStage: existing.stage,
      toStage: data.stage,
      changedBy: currentUser.name,
      changedAt: updatedAt,
      timeInPreviousStageMs: Math.max(0, updatedAt.getTime() - new Date(existing.stageEnteredAt || existing.updatedAt || existing.createdAt).getTime()),
    } : null;
    setDeals((prev) => prev.map((deal) => deal.id === dealId ? {
      ...deal, ...data, id: deal.id, organizationId: deal.organizationId, createdAt: deal.createdAt,
      company: data.company || scopedCustomers.find((customer) => customer.id === data.customerId)?.company || null,
      status: data.stage === 'WON' ? 'WON' : data.stage === 'LOST' ? 'LOST' : 'OPEN',
      stageEnteredAt: stageHistory ? updatedAt : deal.stageEnteredAt,
      stageHistory: stageHistory ? [...(deal.stageHistory || []), stageHistory] : deal.stageHistory || [],
      activities: [...activities, ...(deal.activities || [])],
      updatedAt, lastActivityAt: updatedAt,
    } : deal));
    toast.success('Deal updated');
  };

  const handleBulkUpdateDeals = (ids: string[], updates: Partial<Deal>) => {
    const changedAt = new Date();
    setDeals((prev) => prev.map((deal) => {
      if (!ids.includes(deal.id)) return deal;
      const targetStage = updates.stage || (updates.status === 'OPEN' && (deal.stage === 'WON' || deal.stage === 'LOST') ? 'NEW' : deal.stage);
      const stageChanged = targetStage !== deal.stage;
      if (!stageChanged) return { ...deal, ...updates, updatedAt: changedAt };
      const history = { id: `stage_${Date.now()}_${deal.id}`, fromStage: deal.stage, toStage: targetStage, changedBy: currentUser.name, changedAt, timeInPreviousStageMs: Math.max(0, changedAt.getTime() - new Date(deal.stageEnteredAt || deal.updatedAt || deal.createdAt).getTime()) };
      const activity = { id: `activity_${Date.now()}_${deal.id}`, type: targetStage === 'WON' ? 'WON' as const : targetStage === 'LOST' ? 'LOST' as const : 'STAGE_CHANGED' as const, description: targetStage === 'LOST' ? `Deal marked lost: ${updates.lossReason || 'Reason not provided'}` : targetStage === 'WON' ? 'Deal marked won' : `Stage changed from ${deal.stage} to ${targetStage}`, user: currentUser.name, relatedEntity: 'Stage', createdAt: changedAt };
      return { ...deal, ...updates, stage: targetStage, status: updates.status || (targetStage === 'WON' ? 'WON' : targetStage === 'LOST' ? 'LOST' : 'OPEN'), probability: updates.probability ?? (targetStage === 'WON' ? 100 : targetStage === 'LOST' ? 0 : deal.probability), stageHistory: [...(deal.stageHistory || []), history], activities: [activity, ...(deal.activities || [])], stageEnteredAt: changedAt, updatedAt: changedAt, lastActivityAt: changedAt };
    }));
    toast.success(`Updated ${ids.length} deals`);
  };

  const handleDeleteDeals = (ids: string[]) => {
    setDeals((prev) => prev.filter((deal) => !ids.includes(deal.id)));
    toast.success(`Deleted ${ids.length} deals`);
  };

  const handleCreateDealTask = (data: { title: string; assignedToId: string | null; priority: Task['priority']; dueDate: Date | null; notes: string; dealId: string }) => {
    const createdAt = new Date();
    const task: Task = { id: `task_${Date.now()}`, ...data, completed: false, organizationId: currentOrgId, createdAt };
    setTasks((prev) => [task, ...prev]);
    setDeals((prev) => prev.map((deal) => deal.id === data.dealId ? {
      ...deal,
      tasks: [task, ...(deal.tasks || [])],
      activities: [{ id: `activity_${Date.now()}`, type: 'TASK_CREATED', description: `Task created: ${data.title}`, user: currentUser.name, relatedEntity: data.title, createdAt }, ...(deal.activities || [])],
      updatedAt: createdAt,
      lastActivityAt: createdAt,
    } : deal));
    toast.success('Deal task created');
  };

  const handleCreateOrderFromDeal = (deal: Deal) => {
    const createdAt = new Date();
    setDeals((prev) => prev.map((item) => {
      if (item.id !== deal.id || item.orderHandoff) return item;
      const handoff = {
        id: `order_draft_${Date.now()}`,
        customerId: deal.customerId || item.customerId || '',
        amount: deal.value,
        currency: deal.currency || 'USD',
        status: 'DRAFT' as const,
        createdAt,
      };
      const activity = { id: `activity_${Date.now()}`, type: 'UPDATED' as const, description: 'Draft order handoff created from won deal', user: currentUser.name, relatedEntity: 'Order Handoff', createdAt };
      return { ...item, stage: 'WON', status: 'WON', probability: 100, customerId: handoff.customerId || item.customerId, orderHandoff: handoff, activities: [activity, ...(item.activities || [])], updatedAt: createdAt, lastActivityAt: createdAt };
    }));
    toast.success(`Draft order handoff created from ${deal.title}`);
  };

  // Customers
  const handleSaveCustomer = async (data: any) => {
    if (selectedCustomer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === selectedCustomer.id ? { ...c, ...data, id: c.id, createdAt: c.createdAt, updatedAt: new Date(), lastActivityAt: new Date() } : c))
      );
      toast.success('Customer account updated');
    } else {
      const newCust: Customer = {
        id: `cust_${Date.now()}`,
        ...data,
        organizationId: currentOrgId,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      };
      setCustomers((prev) => [newCust, ...prev]);
      toast.success('New customer account created');
    }
    setIsCustomerModalOpen(false);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    toast.success('Customer account deleted');
  };

  const handleBulkUpdateCustomers = (ids: string[], updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((customer) => ids.includes(customer.id)
      ? { ...customer, ...updates, updatedAt: new Date() }
      : customer));
    toast.success(`Updated ${ids.length} customer${ids.length === 1 ? '' : 's'}`);
  };

  const createDealForCustomer = (customer: Customer) => {
    const title = window.prompt('Deal name');
    if (!title?.trim()) return;
    const amount = Number(window.prompt('Deal value', '0'));
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error('Enter a valid deal value');
      return;
    }
    handleCreateDeal({ title: title.trim(), value: amount, stage: 'QUALIFIED', probability: 25, customerId: customer.id, assignedToId: customer.assignedToId || currentUser.id });
  };

  const createTaskForCustomer = (customer: Customer, title: string) => {
    const task: Task = {
      id: `task_${Date.now()}`, title, dueDate: null, completed: false, organizationId: currentOrgId,
      assignedToId: currentUser.id, customerId: customer.id, createdAt: new Date(),
    };
    setTasks((prev) => [task, ...prev]);
    setCustomers((prev) => prev.map((item) => item.id === customer.id ? { ...item, updatedAt: new Date(), lastActivityAt: new Date() } : item));
    toast.success('Customer follow-up task created');
  };

  const handleCustomerQuickAction = (customer: Customer, action: 'note' | 'deal' | 'order' | 'task') => {
    if (action === 'deal') return createDealForCustomer(customer);
    if (action === 'task') {
      const title = window.prompt(`Task for ${customer.name}`);
      if (title?.trim()) createTaskForCustomer(customer, title.trim());
      return;
    }
    if (action === 'order') {
      toast.info('Order records are not available in this workspace yet');
      return;
    }
    const note = window.prompt(`Add a note for ${customer.name}`);
    if (note?.trim()) {
      setCustomers((prev) => prev.map((item) => item.id === customer.id
        ? { ...item, notes: [item.notes, note.trim()].filter(Boolean).join('\n\n'), updatedAt: new Date(), lastActivityAt: new Date() }
        : item));
      toast.success('Customer note added');
    }
  };

  const createTicketForCustomer = (customer: Customer) => {
    setSelectedTicket(null);
    setTicketCustomerId(customer.id);
    setIsTicketModalOpen(true);
  };

  // Tickets
  const handleSaveTicket = async (data: any) => {
    if (selectedTicket) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id ? { ...t, ...data, updatedAt: new Date() } : t
        )
      );
      toast.success('Support ticket updated');
    } else {
      const newTicket: Ticket = {
        id: `t_${Date.now()}`,
        ...data,
        organizationId: currentOrgId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTickets((prev) => [newTicket, ...prev]);
      toast.success('Support ticket logged');
    }
    setIsTicketModalOpen(false);
  };

  const handleDeleteTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    toast.success('Ticket deleted');
  };

  // Tasks
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const completed = !t.completed;
          toast.success(completed ? 'Task completed' : 'Task reopened');
          return { ...t, completed };
        }
        return t;
      })
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      dueDate: newTaskDueDate ? new Date(newTaskDueDate) : null,
      completed: false,
      organizationId: currentOrgId,
      assignedToId: currentUser.id,
      createdAt: new Date(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle('');
    setNewTaskDueDate('');
    toast.success('Task scheduled');
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success('Task removed');
  };

  // Team Invite
  const handleInviteTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error('Please enter name and email');
      return;
    }
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      organizationId: currentOrgId,
      createdAt: new Date(),
    };
    setUsers((prev) => [...prev, newUser]);
    setIsInviteTeamOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInviteRole('SALES');
    toast.success(`Invitation sent to ${newUser.email}`);
  };

  // Dashboard Aggregations
  const openDeals = scopedDeals.filter((d) => d.stage !== 'WON' && d.stage !== 'LOST');
  const openDealsValue = openDeals.reduce((sum, d) => sum + d.value, 0);
  const openTickets = scopedTickets.filter((t) => t.status !== 'RESOLVED');
  const tasksDue = scopedTasks.filter((t) => !t.completed);

  const monthlyRevenue = [
    { month: 'Apr', revenue: 64000, dealsWon: 5 },
    { month: 'May', revenue: 78500, dealsWon: 7 },
    { month: 'Jun', revenue: 92000, dealsWon: 9 },
    { month: 'Jul', revenue: 86400, dealsWon: 8 },
    { month: 'Aug', revenue: 114000, dealsWon: 12 },
    { month: 'Sep', revenue: 142500, dealsWon: 14 },
  ];

  const stages: DealStage[] = ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
  const dealsByStage = stages.map((st) => {
    const dList = scopedDeals.filter((d) => d.stage === st);
    return {
      stage: st,
      count: dList.length,
      totalValue: dList.reduce((acc, curr) => acc + curr.value, 0),
    };
  });

  // Landing Page Route
  if (activeView === '/') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col selection:bg-indigo-500 selection:text-white">
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Kanban className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">
              Wordbit<span className="text-indigo-400">X</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/login')}
              className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => router.push('/register')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4"
            >
              <span className="hidden sm:inline">Create Workspace</span>
              <span className="sm:hidden">Get Started</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-[11px] sm:text-xs font-semibold mb-6 max-w-full text-center">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Next.js 14 • PostgreSQL • Prisma • NextAuth Multi-Tenant CRM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
            Enterprise sales velocity with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
              multi-tenant precision
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            Drag-and-drop opportunity pipelines, predictive lead scoring, multi-tenant RBAC, and unified support desks built for scale.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none">
            <Button
              size="lg"
              onClick={() => {
                router.push('/dashboard');
              }}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 sm:px-8 py-3 rounded-xl font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2"
            >
              <span>Launch Live App</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/register')}
              className="w-full sm:w-auto border-slate-700 bg-slate-800/80 text-white hover:bg-slate-800 px-6 sm:px-8 py-3 rounded-xl font-semibold"
            >
              Register Organization
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Login Page Route
  if (activeView === '/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-3 sm:p-4">
        <Card className="w-full max-w-md border-slate-800 bg-slate-950/90 text-white shadow-2xl backdrop-blur">
          <CardHeader className="text-center space-y-2 p-4 sm:p-6 pb-2">
            <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Kanban className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-white">Welcome back to WordbitX</CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">
              Sign in to access your organization dashboard and sales pipeline
            </CardDescription>
          </CardHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success('Signed in as Sarah Jenkins (Admin)');
              router.push('/dashboard');
            }}
          >
            <CardContent className="space-y-4 p-4 sm:p-6 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    defaultValue="sarah.jenkins@acme.io"
                    className="pl-9 bg-slate-900 border-slate-800 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    defaultValue="password123"
                    className="pl-9 bg-slate-900 border-slate-800 text-white"
                    required
                  />
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-indigo-300 block">Quick Demo Credentials:</span>
                <span className="break-all">sarah.jenkins@acme.io / password123</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 p-4 sm:p-6 pt-0">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 font-semibold py-2">
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-xs text-indigo-400 hover:underline text-center"
              >
                Need a new tenant workspace? Register Organization
              </button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // Register Page Route
  if (activeView === '/register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-3 sm:p-4">
        <Card className="w-full max-w-md border-slate-800 bg-slate-950/90 text-white shadow-2xl backdrop-blur">
          <CardHeader className="text-center space-y-2 p-4 sm:p-6 pb-2">
            <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Kanban className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-white">Create WordbitX Workspace</CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">
              Spins up a new tenant Organization and Super Admin
            </CardDescription>
          </CardHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const newOrgId = `org_${Date.now()}`;
              const newOrg: Organization = {
                id: newOrgId,
                name: 'Apex Innovators LLC',
                createdAt: new Date(),
              };
              setOrganizations((prev) => [...prev, newOrg]);
              setCurrentOrgId(newOrgId);
              toast.success('Organization registered successfully! Welcome to your new workspace.');
              router.push('/dashboard');
            }}
          >
            <CardContent className="space-y-4 p-4 sm:p-6 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Company Name</label>
                <Input defaultValue="Apex Innovators LLC" className="bg-slate-900 border-slate-800 text-white" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                <Input defaultValue="Marcus Taylor" className="bg-slate-900 border-slate-800 text-white" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Work Email</label>
                <Input type="email" defaultValue="marcus@apextech.io" className="bg-slate-900 border-slate-800 text-white" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                <Input type="password" defaultValue="secret123" className="bg-slate-900 border-slate-800 text-white" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 p-4 sm:p-6 pt-0">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 font-semibold py-2">
                <span>Create Organization & Launch</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-xs text-indigo-400 hover:underline text-center"
              >
                Already registered? Sign In
              </button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // --- Main Dashboard App Shell ---
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100 overflow-x-hidden">
      {/* Navigation Sidebar (Desktop persistent + Mobile off-canvas drawer) */}
      <Sidebar
        currentPath={activeView}
        onNavigate={(path) => navigate(path)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        user={{
          name: currentUser?.name || 'Sarah Jenkins',
          email: currentUser?.email || 'sarah@acme.io',
          role: currentUser?.role || 'ADMIN',
          organizationName: currentOrg?.name || 'Acme Technologies Inc.',
        }}
        onLogout={() => {
          router.push('/login');
          toast.info('Signed out of session');
        }}
      />

      {/* Main Body with bottom padding for mobile navigation bar */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Topbar
          title={
            activeView === '/dashboard'
              ? 'Executive Dashboard'
              : activeView.replace('/', '').replace('-', ' ')
          }
          organizations={organizations}
          currentOrgId={currentOrgId}
          onSelectOrg={handleSwitchOrg}
          onToggleMobileSidebar={() => setMobileMenuOpen((prev) => !prev)}
          onOpenQuickCreate={(type) => {
            if (type === 'lead') {
              setSelectedLead(null);
              setIsLeadModalOpen(true);
            }
            if (type === 'deal') {
              navigate('/pipeline');
            }
            if (type === 'ticket') {
              setSelectedTicket(null);
              setIsTicketModalOpen(true);
            }
          }}
        />

        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto min-w-0">
          {/* VIEW: Dashboard */}
          {activeView === '/dashboard' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Executive Revenue Overview
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Real-time pipeline analytics, lead acquisition velocity, and SLA telemetry.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ● Live Synchronized
                  </span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatsCard
                  title="Total Active Leads"
                  value={scopedLeads.length}
                  icon={Users}
                  change={18.2}
                  colorVariant="indigo"
                />
                <StatsCard
                  title="Open Pipeline Value"
                  value={formatCurrency(openDealsValue)}
                  icon={DollarSign}
                  change={24.5}
                  colorVariant="emerald"
                />
                <StatsCard
                  title="Active Support Tickets"
                  value={openTickets.length}
                  icon={LifeBuoy}
                  change={-12.5}
                  changeLabel="resolution pace"
                  colorVariant="amber"
                />
                <StatsCard
                  title="Tasks Due Today"
                  value={tasksDue.length}
                  icon={CheckSquare}
                  change={75}
                  changeLabel="completion rate"
                  colorVariant="purple"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
                <RevenueChart data={monthlyRevenue} />
                <PipelineChart data={dealsByStage} />
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold">Recent Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scopedDeals.slice(0, 3).map((deal) => {
                      const rep = scopedUsers.find((u) => u.id === deal.assignedToId);
                      return (
                        <div
                          key={deal.id}
                          onClick={() => navigate('/deals/detail', deal.id)}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-300 transition"
                        >
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{deal.title}</h4>
                            <span className="text-xs text-slate-400">Rep: {rep?.name || 'Sarah Jenkins'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-900 dark:text-white block">{formatCurrency(deal.value)}</span>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{deal.stage}</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold">Urgent Customer Inquiries</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scopedTickets.slice(0, 3).map((ticket) => {
                      const customer = scopedCustomers.find((c) => c.id === ticket.customerId);
                      return (
                        <div
                          key={ticket.id}
                          onClick={() => navigate('/tickets/detail', ticket.id)}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-300 transition"
                        >
                          <div className="min-w-0 pr-2">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{ticket.subject}</h4>
                            <span className="text-xs text-slate-400">{customer?.company || customer?.name || 'Customer Account'}</span>
                          </div>
                          <Badge variant={ticket.priority === 'URGENT' ? 'destructive' : 'warning'}>
                            {ticket.priority}
                          </Badge>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* VIEW: Leads */}
          {activeView === '/leads' && (
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
                leads={scopedLeads}
                users={scopedUsers}
                onAddLead={() => {
                  setSelectedLead(null);
                  setIsLeadModalOpen(true);
                }}
                onEditLead={(lead) => {
                  setSelectedLead(lead);
                  setIsLeadModalOpen(true);
                }}
                onDeleteLead={handleDeleteLead}
                onViewLead={(id) => navigate('/leads/detail', id)}
              />
            </div>
          )}

          {/* VIEW: Lead Detail */}
          {activeView === '/leads/detail' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/leads')} className="space-x-1.5">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Leads</span>
                </Button>
                <Button onClick={() => navigate('/pipeline')} className="space-x-1">
                  <span>Convert to Opportunity</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>

              {(() => {
                const lead = scopedLeads.find((l) => l.id === routeParam) || scopedLeads[0];
                if (!lead) return <div>Lead not found</div>;
                const rep = scopedUsers.find((u) => u.id === lead.assignedToId);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <Card className="lg:col-span-2">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                          <CardTitle className="text-lg sm:text-xl">{lead.name}</CardTitle>
                          <p className="text-xs text-slate-400 mt-1">Lead ID: {lead.id}</p>
                        </div>
                        <Badge variant="success">{lead.status}</Badge>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                            <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">Created {formatDate(lead.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                            <UserCheck className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">Assigned Rep: {rep?.name || 'Unassigned'}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Lead Notes & Context</h4>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                            Prospect showed high engagement with enterprise feature matrix. Qualified for immediate sales executive engagement.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Lead Propensity</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900">
                          <span className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{lead.score}</span>
                          <span className="text-xs text-slate-500 block mt-1 font-semibold uppercase tracking-wider">Propensity Score</span>
                        </div>
                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span>Acquisition Channel</span>
                            <span className="font-semibold">{lead.source || 'Direct Outreach'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span>Multi-Tenant Partition</span>
                            <span className="font-semibold text-emerald-600">Active</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW: Pipeline */}
          {activeView === '/pipeline' && (
            <SalesPipeline
              deals={scopedDeals}
              users={scopedUsers}
              customers={scopedCustomers}
              leadCount={scopedLeads.length}
              onUpdateDealStage={handleUpdateDealStage}
              onCreateDeal={handleCreateDeal}
              onSaveDeal={handleSaveDeal}
              onBulkUpdateDeals={handleBulkUpdateDeals}
              onDeleteDeals={handleDeleteDeals}
              onCreateOrderFromDeal={handleCreateOrderFromDeal}
              onViewDeal={(id) => navigate('/deals/detail', id)}
            />
          )}

          {/* VIEW: Deal Detail */}
          {activeView === '/deals/detail' && (() => {
            const deal = scopedDeals.find((item) => item.id === routeParam);
            if (!deal) return <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Deal not found</div>;
            return <DealDetails
              key={deal.id}
              deal={deal}
              customer={scopedCustomers.find((customer) => customer.id === deal.customerId)}
              customers={scopedCustomers}
              tasks={scopedTasks}
              users={scopedUsers}
              currentUser={currentUser}
              onBack={() => navigate('/pipeline')}
              onOpenCustomer={(id) => navigate('/customers/detail', id)}
              onSaveDeal={handleSaveDeal}
              onUpdateStage={handleUpdateDealStage}
              onUpdateDeal={(id, updates) => setDeals((prev) => prev.map((item) => item.id === id ? { ...item, ...updates, id: item.id, createdAt: item.createdAt, updatedAt: new Date() } : item))}
              onCreateTask={handleCreateDealTask}
              onCreateOrderFromDeal={handleCreateOrderFromDeal}
            />;
          })()}

          {/* VIEW: Customers */}
          {activeView === '/customers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Customers</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Customer management, account health, and connected business relationships.
                  </p>
                </div>
              </div>

              <CustomerTable
                customers={scopedCustomers}
                deals={scopedDeals}
                tickets={scopedTickets}
                users={scopedUsers}
                onAddCustomer={() => {
                  setSelectedCustomer(null);
                  setIsCustomerModalOpen(true);
                }}
                onEditCustomer={(customer) => {
                  setSelectedCustomer(customer);
                  setIsCustomerModalOpen(true);
                }}
                onDeleteCustomer={handleDeleteCustomer}
                onViewCustomer={(id) => navigate('/customers/detail', id)}
                onQuickAction={handleCustomerQuickAction}
                onBulkUpdate={handleBulkUpdateCustomers}
              />
            </div>
          )}

          {/* VIEW: Customer Detail */}
          {activeView === '/customers/detail' && (() => {
            const customer = scopedCustomers.find((item) => item.id === routeParam);
            if (!customer) return <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Customer not found</div>;
            return <CustomerDetails
              key={customer.id}
              customer={customer}
              deals={scopedDeals}
              tickets={scopedTickets}
              tasks={scopedTasks}
              users={scopedUsers}
              onBack={() => navigate('/customers')}
              onEdit={(record) => { setSelectedCustomer(record); setIsCustomerModalOpen(true); }}
              onOpenDeal={(id) => navigate('/deals/detail', id)}
              onOpenTicket={(id) => navigate('/tickets/detail', id)}
              onCreateDeal={createDealForCustomer}
              onCreateTask={createTaskForCustomer}
              onCreateTicket={createTicketForCustomer}
              onSaveNotes={(customerNotes) => setCustomers((prev) => prev.map((item) => item.id === customer.id ? { ...item, customerNotes, notes: customerNotes.map((note) => note.content).join('\n\n'), updatedAt: new Date(), lastActivityAt: new Date() } : item))}
              onSaveCalls={(calls) => setCustomers((prev) => prev.map((item) => item.id === customer.id ? { ...item, calls, updatedAt: new Date(), lastActivityAt: new Date() } : item))}
            />;
          })()}

          {(activeView === '/orders' || activeView === '/orders/detail') && (
            <OrderWorkspace
              orders={scopedOrders}
              customers={scopedCustomers}
              deals={scopedDeals}
              users={scopedUsers}
              currentUser={currentUser}
              selectedOrderId={activeView === '/orders/detail' ? routeParam : null}
              onOrdersChange={(nextOrders) => setOrders((previous) => [
                ...previous.filter((order) => order.organizationId !== currentOrgId),
                ...nextOrders,
              ])}
              onNavigate={navigate}
              onAddCustomer={() => { setSelectedCustomer(null); setIsCustomerModalOpen(true); }}
            />
          )}

          {/* VIEW: Tickets */}
          {activeView === '/tickets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Helpdesk Desk</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Customer inquiries, issue triage, SLA tracking, and resolution workflows.
                  </p>
                </div>
              </div>

              <TicketTable
                tickets={scopedTickets}
                customers={scopedCustomers}
                users={scopedUsers}
                onAddTicket={() => {
                  setSelectedTicket(null);
                  setIsTicketModalOpen(true);
                }}
                onEditTicket={(ticket) => {
                  setSelectedTicket(ticket);
                  setIsTicketModalOpen(true);
                }}
                onDeleteTicket={handleDeleteTicket}
                onViewTicket={(id) => navigate('/tickets/detail', id)}
              />
            </div>
          )}

          {/* VIEW: Ticket Detail */}
          {activeView === '/tickets/detail' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/tickets')} className="space-x-1.5">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Tickets</span>
                </Button>
              </div>

              {(() => {
                const ticket = scopedTickets.find((t) => t.id === routeParam) || scopedTickets[0];
                if (!ticket) return <div>Ticket not found</div>;
                const customer = scopedCustomers.find((c) => c.id === ticket.customerId);
                const assigned = scopedUsers.find((u) => u.id === ticket.assignedToId);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <Card className="lg:col-span-2">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                          <CardTitle className="text-lg sm:text-xl">{ticket.subject}</CardTitle>
                          <p className="text-xs text-slate-400 mt-1">Ticket ID: {ticket.id}</p>
                        </div>
                        <Badge variant="cyan">{ticket.status}</Badge>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                            <Building className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">Account: {customer?.company || customer?.name || 'Customer Account'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">Logged: {formatDate(ticket.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                            <UserCheck className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">Assignee: {assigned?.name || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">SLA Response: 45 min</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Problem Description & Context
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed font-mono">
                            {ticket.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Severity & SLA</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-center">
                          <span className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                            {ticket.priority} PRIORITY
                          </span>
                          <span className="text-xs text-slate-500">Critical Support Response</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW: Tasks */}
          {activeView === '/tasks' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Actionable Tasks</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Keep track of sales outreach follow-ups, client meetings, and support resolutions.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <CheckSquare className="h-4 w-4 mr-1 text-indigo-600" />
                  <span>
                    {scopedTasks.filter((t) => t.completed).length} of {scopedTasks.length} Completed
                  </span>
                </div>
              </div>

              {/* Add Task */}
              <Card>
                <CardContent className="p-4">
                  <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="What needs to get done next?"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="w-full sm:w-44">
                      <Input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                      />
                    </div>
                    <Button type="submit" size="sm" className="space-x-1 shrink-0">
                      <Plus className="h-4 w-4" />
                      <span>Add Task</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Tasks List */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Checklist</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-slate-100 dark:divide-slate-800 p-0">
                  {scopedTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-4 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                        task.completed ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30' : ''
                      }`}
                    >
                      <div
                        className="flex items-center space-x-3 cursor-pointer select-none flex-1 min-w-0"
                        onClick={() => handleToggleTask(task.id)}
                      >
                        <button type="button" className="text-slate-400 hover:text-indigo-600 shrink-0">
                          {task.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>
                        <span
                          className={`text-sm font-medium ${
                            task.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0 ml-4">
                        {task.dueDate && (
                          <div className="flex items-center space-x-1 text-xs text-slate-400">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* VIEW: Reports */}
          {activeView === '/reports' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Revenue & Sales Analytics</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Historical conversion rates, executive revenue pacing, and sales rep performance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-semibold">Overall Win Rate</span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">87.5%</h3>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-semibold">Average Deal Size</span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(41500)}</h3>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-semibold">Sales Velocity Cycle</span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">18.4 Days</h3>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RevenueChart data={monthlyRevenue} />
                <PipelineChart data={dealsByStage} />
              </div>
            </div>
          )}

          {/* VIEW: Settings */}
          {activeView === '/settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workspace Settings</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tenant organization branding, locale, and security settings.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-base">Organization Profile</CardTitle>
                  </div>
                  <CardDescription>Update your company identifier and reporting defaults.</CardDescription>
                </CardHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast.success('Workspace profile settings saved');
                  }}
                >
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Organization Name
                      </label>
                      <Input defaultValue={currentOrg.name} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Default Currency
                        </label>
                        <Input defaultValue="USD ($)" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Fiscal Cycle
                        </label>
                        <Input defaultValue="January - December" />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-800 dark:text-indigo-300 flex items-center space-x-2">
                      <Shield className="h-4 w-4 shrink-0 text-indigo-600" />
                      <span>
                        Multi-tenant logical isolation is enforced for organization ID: <strong>{currentOrgId}</strong>
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-2">
                    <Button type="submit">Save Settings</Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          )}

          {/* VIEW: Settings / Team */}
          {activeView === '/settings/team' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Team & Role-Based Access Control
                    </h1>
                    <Badge variant="purple" className="text-xs">
                      ADMIN ONLY
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Invite colleagues, designate departmental roles, and configure organization permissions.
                  </p>
                </div>

                <Button onClick={() => setIsInviteTeamOpen(true)} size="sm" className="space-x-1.5">
                  <UserPlus className="h-4 w-4" />
                  <span>Invite Member</span>
                </Button>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Active Members ({scopedUsers.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table className="min-w-[620px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Email Address</TableHead>
                        <TableHead>Assigned Role</TableHead>
                        <TableHead>Joined Workspace</TableHead>
                        <TableHead className="text-right">Manage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scopedUsers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2.5">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                                {member.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {member.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <span>{member.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <select
                              value={member.role}
                              onChange={(e) => {
                                const newRole = e.target.value as Role;
                                setUsers((prev) =>
                                  prev.map((u) => (u.id === member.id ? { ...u, role: newRole } : u))
                                );
                                toast.success(`Updated role for ${member.name}`);
                              }}
                              className="text-xs font-semibold py-1 px-2 rounded-md border border-slate-200 bg-white text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="SALES">SALES</option>
                              <option value="SUPPORT">SUPPORT</option>
                              <option value="AGENT">AGENT</option>
                            </select>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {formatDate(member.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (scopedUsers.length <= 1) {
                                  toast.error('Cannot remove last admin');
                                  return;
                                }
                                setUsers((prev) => prev.filter((u) => u.id !== member.id));
                                toast.success('Member removed');
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                              title="Remove member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentPath={activeView}
        onNavigate={navigate}
        onOpenMenu={() => setMobileMenuOpen(true)}
      />

      {/* Global Modals */}
      <LeadForm
        open={isLeadModalOpen}
        onOpenChange={setIsLeadModalOpen}
        onSubmit={handleSaveLead}
        lead={selectedLead}
        users={scopedUsers}
      />

      <CustomerForm
        open={isCustomerModalOpen}
        onOpenChange={setIsCustomerModalOpen}
        onSubmit={handleSaveCustomer}
        customer={selectedCustomer}
        users={scopedUsers}
      />

      <TicketForm
        open={isTicketModalOpen}
        onOpenChange={setIsTicketModalOpen}
        onSubmit={handleSaveTicket}
        ticket={selectedTicket}
        customers={ticketCustomerId && isTicketModalOpen
          ? [scopedCustomers.find((customer) => customer.id === ticketCustomerId), ...scopedCustomers.filter((customer) => customer.id !== ticketCustomerId)].filter((customer): customer is Customer => Boolean(customer))
          : scopedCustomers}
        users={scopedUsers}
      />

      {/* Invite Member Dialog */}
      <Dialog open={isInviteTeamOpen} onOpenChange={setIsInviteTeamOpen}>
        <DialogContent>
          <DialogHeader onClose={() => setIsInviteTeamOpen(false)}>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Grant access to your organization's CRM workspace and assign their role.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteTeam} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name *
              </label>
              <Input
                placeholder="e.g. Rachel Adams"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Work Email *
              </label>
              <Input
                type="email"
                placeholder="rachel@acme.io"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Permission Role *
              </label>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
              >
                <option value="ADMIN">ADMIN - Full administrative access</option>
                <option value="SALES">SALES - Manage opportunities, leads, accounts</option>
                <option value="SUPPORT">SUPPORT - Manage customer tickets & SLAs</option>
                <option value="AGENT">AGENT - General read & outreach permissions</option>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsInviteTeamOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Invitation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toast Notification Container */}
      <Toaster />
    </div>
  );
}
