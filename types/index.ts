export type Role = 'ADMIN' | 'SALES' | 'SUPPORT' | 'AGENT';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CONVERTED' | 'LOST' | 'FOLLOW_UP';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type DealStage = 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'VIP' | 'AT_RISK' | 'ARCHIVED';
export type CustomerType = 'INDIVIDUAL' | 'SMB' | 'MID_MARKET' | 'ENTERPRISE' | 'STRATEGIC';

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
  firstName?: string;
  lastName?: string;
  name: string;
  company?: string | null;
  email: string | null;
  phone: string | null;
  alternatePhone?: string | null;
  source: string | null;
  industry?: string | null;
  jobTitle?: string | null;
  companySize?: string | null;
  score: number;
  status: LeadStatus;
  priority?: LeadPriority;
  organizationId: string;
  organization?: Organization;
  assignedToId: string | null;
  assignedTo?: User | null;
  assignedTeam?: string | null;
  assignedDealer?: string | null;
  nextFollowUp?: Date | string | null;
  followUpType?: string | null;
  notes?: string | null;
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
  firstName?: string;
  lastName?: string;
  alternatePhone?: string | null;
  jobTitle?: string | null;
  industry?: string | null;
  companySize?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  customerType?: CustomerType;
  status?: CustomerStatus;
  source?: string | null;
  assignedToId?: string | null;
  assignedTeam?: string | null;
  assignedDealer?: string | null;
  tags?: string[];
  notes?: string | null;
  customerNotes?: CustomerNote[];
  calls?: CustomerCall[];
  updatedAt?: Date | string;
  lastActivityAt?: Date | string | null;
  totalOrders?: number;
  totalRevenue?: number;
  outstandingBalance?: number;
  paidAmount?: number;
  pendingAmount?: number;
  overdueAmount?: number;
  orderStatus?: string;
  paymentStatus?: string;
  organizationId: string;
  organization?: Organization;
  deals?: Deal[];
  tickets?: Ticket[];
  createdAt: Date | string;
}

export interface CustomerNote {
  id: string;
  content: string;
  author: string;
  createdAt: Date | string;
}

export interface CustomerCall {
  id: string;
  date: Date | string;
  agent: string;
  type: 'Incoming' | 'Outgoing' | 'Missed' | 'Callback';
  duration: string;
  outcome: string;
  notes: string;
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
  customerId?: string | null;
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
