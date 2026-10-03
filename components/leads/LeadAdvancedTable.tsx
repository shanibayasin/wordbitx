import React, { useMemo, useState } from 'react';
import { Badge } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table.tsx';
import { formatDate } from '../../lib/utils.ts';
import { Lead, LeadPriority, LeadStatus, User } from '../../types/index.ts';
import { Search, Plus, Filter, SlidersHorizontal, CalendarRange, Download, Eye, Pencil, Trash2, CheckCheck, ArrowUpDown } from 'lucide-react';

interface LeadAdvancedTableProps {
  leads: Lead[];
  users: User[];
  onAddLead: () => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onViewLead: (id: string) => void;
  onConvertLead?: (lead: Lead) => void;
  isLoading?: boolean;
}

interface FilterState {
  status: string;
  source: string;
  priority: string;
  assignedUser: string;
  minScore: string;
  dateFrom: string;
  dateTo: string;
}

const defaultFilters: FilterState = {
  status: 'ALL',
  source: 'ALL',
  priority: 'ALL',
  assignedUser: 'ALL',
  minScore: '0',
  dateFrom: '',
  dateTo: '',
};

function getLeadScoreLabel(score: number) {
  if (score >= 81) return 'Hot';
  if (score >= 61) return 'High';
  if (score >= 31) return 'Medium';
  return 'Low';
}

function getStatusBadge(status: LeadStatus) {
  switch (status) {
    case 'NEW':
      return <Badge variant="cyan">New</Badge>;
    case 'CONTACTED':
      return <Badge variant="secondary">Contacted</Badge>;
    case 'QUALIFIED':
      return <Badge variant="success">Qualified</Badge>;
    case 'PROPOSAL':
      return <Badge variant="purple">Proposal</Badge>;
    case 'NEGOTIATION':
      return <Badge variant="warning">Negotiation</Badge>;
    case 'CONVERTED':
      return <Badge variant="success">Converted</Badge>;
    case 'LOST':
      return <Badge variant="destructive">Lost</Badge>;
    case 'FOLLOW_UP':
      return <Badge variant="warning">Follow Up</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getPriorityBadge(priority: Lead['priority']) {
  switch (priority) {
    case 'LOW':
      return <Badge variant="secondary">Low</Badge>;
    case 'MEDIUM':
      return <Badge variant="default">Medium</Badge>;
    case 'HIGH':
      return <Badge variant="warning">High</Badge>;
    case 'URGENT':
      return <Badge variant="destructive">Urgent</Badge>;
    default:
      return <Badge variant="secondary">{priority}</Badge>;
  }
}

const sortOptions = ['Newest', 'Oldest', 'Score High', 'Score Low', 'Name A-Z'];

export function LeadAdvancedTable({
  leads,
  users,
  onAddLead,
  onEditLead,
  onDeleteLead,
  onViewLead,
  onConvertLead,
  isLoading = false,
}: LeadAdvancedTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredLeads = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...leads]
      .filter((lead) => {
        const matchesSearch =
          !normalizedSearch ||
          [lead.name, lead.company, lead.email, lead.phone]
            .filter((value): value is string => typeof value === 'string')
            .some((value) => value.toLowerCase().includes(normalizedSearch));

        const matchesStatus = filters.status === 'ALL' || lead.status === filters.status;
        const matchesSource = filters.source === 'ALL' || lead.source === filters.source;
        const matchesPriority = filters.priority === 'ALL' || lead.priority === filters.priority;
        const matchesUser = filters.assignedUser === 'ALL' || lead.assignedToId === filters.assignedUser;
        const matchesMinScore = lead.score >= Number(filters.minScore || 0);

        const matchesFrom = !filters.dateFrom || new Date(lead.createdAt) >= new Date(filters.dateFrom);
        const matchesTo = !filters.dateTo || new Date(lead.createdAt) <= new Date(new Date(filters.dateTo).getTime() + 86400000);

        return matchesSearch && matchesStatus && matchesSource && matchesPriority && matchesUser && matchesMinScore && matchesFrom && matchesTo;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'Oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'Score High':
            return b.score - a.score;
          case 'Score Low':
            return a.score - b.score;
          case 'Name A-Z':
            return a.name.localeCompare(b.name);
          case 'Newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [leads, filters, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const currentPageLeads = filteredLeads.slice((page - 1) * pageSize, page * pageSize);

  const clearFilters = () => { setFilters(defaultFilters); setPage(1); };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-base font-bold">Lead Management</CardTitle>
            <CardDescription>Advanced lead pipeline, scoring, and assignment tracking.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gap-1.5" onClick={onAddLead}>
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.5fr_repeat(5,minmax(0,1fr))]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => { setSearchTerm(event.target.value); setPage(1); }}
                placeholder="Search name, company, email, phone"
                className="pl-9"
              />
            </div>

            <Select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
              <option value="ALL">Status</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
              <option value="FOLLOW_UP">Follow Up</option>
            </Select>

            <Select value={filters.source} onChange={(event) => setFilters((prev) => ({ ...prev, source: event.target.value }))}>
              <option value="ALL">Source</option>
              <option value="Website">Website</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Conference">Conference</option>
              <option value="Referral">Referral</option>
              <option value="Outbound">Outbound</option>
              <option value="Partner">Partner</option>
            </Select>

            <Select value={filters.priority} onChange={(event) => setFilters((prev) => ({ ...prev, priority: event.target.value }))}>
              <option value="ALL">Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Select>

            <Select value={filters.assignedUser} onChange={(event) => setFilters((prev) => ({ ...prev, assignedUser: event.target.value }))}>
              <option value="ALL">Assigned User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </Select>

            <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Min score</label>
              <Select value={filters.minScore} onChange={(event) => setFilters((prev) => ({ ...prev, minScore: event.target.value }))}>
                <option value="0">All</option>
                <option value="30">30+</option>
                <option value="60">60+</option>
                <option value="80">80+</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Created From</label>
              <Input type="date" value={filters.dateFrom} onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Created To</label>
              <Input type="date" value={filters.dateTo} onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))} />
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full gap-2" onClick={clearFilters}>
                <SlidersHorizontal className="h-4 w-4" />
                Clear
              </Button>
            </div>
            <div className="flex items-end">
              <Button className="w-full gap-2">
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-500">Loading leads...</div>
        ) : currentPageLeads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
            No leads match the current filters.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageLeads.map((lead) => {
                    const assignedUser = users.find((user) => user.id === lead.assignedToId);
                    return (
                      <TableRow key={lead.id} className="hover:bg-slate-50/80">
                        <TableCell>
                          <div className="font-semibold text-slate-900">{lead.name}</div>
                          <div className="text-xs text-slate-500">{lead.jobTitle || 'Prospect'}</div>
                        </TableCell>
                        <TableCell>{lead.company || '—'}</TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-700">{lead.email || '—'}</div>
                          <div className="text-xs text-slate-500">{lead.phone || '—'}</div>
                        </TableCell>
                        <TableCell>{lead.source || '—'}</TableCell>
                        <TableCell>{getStatusBadge(lead.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-sm font-semibold text-slate-900">{lead.score}</span>
                            <span className="text-[10px] uppercase tracking-[0.08em] text-slate-500">{getLeadScoreLabel(lead.score)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{assignedUser ? assignedUser.name : 'Unassigned'}</TableCell>
                        <TableCell>{getPriorityBadge(lead.priority)}</TableCell>
                        <TableCell>{lead.nextFollowUp ? formatDate(lead.nextFollowUp) : 'Not scheduled'}</TableCell>
                        <TableCell>{formatDate(lead.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => onViewLead(lead.id)} title="View lead">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onEditLead(lead)} title="Edit lead">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {onConvertLead && (
                              <Button variant="ghost" size="icon" onClick={() => onConvertLead(lead)} title="Convert lead">
                                <CheckCheck className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="text-rose-600 hover:text-rose-700" onClick={() => onDeleteLead(lead.id)} title="Delete lead">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Showing {filteredLeads.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
