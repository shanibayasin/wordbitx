export type Role = 'ADMIN' | 'SALES' | 'SUPPORT' | 'AGENT';

export type LeadStatus = 'NEW' | 'FOLLOW_UP' | 'QUALIFIED' | 'LOST';

export type DealStage = 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Organization {
  id: string;
  _id?: string;
  name: string;
  logoUrl?: string | null;
  createdAt: Date | string;
  users?: User[];
  leads?: Lead[];
  deals?: Deal[];
  customers?: Customer[];
  tickets?: Ticket[];
  tasks?: Task[];
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  organizationId: string;
  avatarUrl?: string | null;
  organization?: Organization;
  createdAt: Date | string;
  assignedLeads?: Lead[];
  assignedDeals?: Deal[];
  assignedTickets?: Ticket[];
  tasks?: Task[];
}

export interface Lead {
  id: string;
  _id?: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  score: number;
  status: LeadStatus;
  organizationId: string;
  organization?: Organization;
  assignedToId: string | null;
  assignedTo?: User | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Deal {
  id: string;
  _id?: string;
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  organizationId: string;
  organization?: Organization;
  assignedToId: string | null;
  assignedTo?: User | null;
  customerId: string | null;
  customer?: Customer | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Customer {
  id: string;
  _id?: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  avatarUrl?: string | null;
  organizationId: string;
  organization?: Organization;
  deals?: Deal[];
  tickets?: Ticket[];
  createdAt: Date | string;
}

export interface Ticket {
  id: string;
  _id?: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  organizationId: string;
  organization?: Organization;
  customerId: string | null;
  customer?: Customer | null;
  assignedToId: string | null;
  assignedTo?: User | null;
  attachments?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Task {
  id: string;
  _id?: string;
  title: string;
  dueDate: Date | string | null;
  completed: boolean;
  organizationId: string;
  organization?: Organization;
  assignedToId: string | null;
  assignedTo?: User | null;
  createdAt: Date | string;
}

export interface DashboardStats {
  totalLeads: number;
  openDealsCount: number;
  openDealsValue: number;
  openTickets: number;
  tasksDueToday: number;
  leadsGrowth: number;
  dealsGrowth: number;
  ticketsChange: number;
  tasksCompletedPercentage: number;
  monthlyRevenue: {
    month: string;
    revenue: number;
    dealsWon: number;
  }[];
  dealsByStage: {
    stage: DealStage;
    count: number;
    totalValue: number;
  }[];
  recentActivity: {
    id: string;
    type: 'deal' | 'lead' | 'ticket' | 'task';
    title: string;
    description: string;
    time: string;
    user?: string;
  }[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  organizationName?: string;
  avatarUrl?: string | null;
}
