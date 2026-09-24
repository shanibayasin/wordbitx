import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Card, CardContent } from '../ui/Card.tsx';
import { Lead, LeadStatus, User } from '../../types/index.ts';
import { formatDate } from '../../lib/utils.ts';
import { Search, Filter, Plus, Edit2, Trash2, ExternalLink, Mail, Phone, LayoutGrid, List } from 'lucide-react';

interface LeadTableProps {
  leads: Lead[];
  users: User[];
  onAddLead: () => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onViewLead: (id: string) => void;
  isLoading?: boolean;
}

export function LeadTable({
  leads,
  users,
  onAddLead,
  onEditLead,
  onDeleteLead,
  onViewLead,
  isLoading = false,
}: LeadTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchTerm)) ||
      (lead.source && lead.source.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'NEW':
        return <Badge variant="cyan">New</Badge>;
      case 'FOLLOW_UP':
        return <Badge variant="warning">Follow Up</Badge>;
      case 'QUALIFIED':
        return <Badge variant="success">Qualified</Badge>;
      case 'LOST':
        return <Badge variant="destructive">Lost</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search, Filter, View Mode, Add Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search leads by name, email, source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <Filter className="h-3.5 w-3.5 text-slate-400 ml-1.5 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="FOLLOW_UP">Follow Up</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          {/* View Mode Toggle for responsive preference */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Cards view (recommended on mobile)"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Data table view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          <Button onClick={onAddLead} size="sm" className="space-x-1.5 shrink-0">
            <Plus className="h-4 w-4" />
            <span>Create Lead</span>
          </Button>
        </div>
      </div>

      {/* Loading & Empty States */}
      {isLoading ? (
        <div className="h-40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <span className="text-sm">Loading lead repository...</span>
          </div>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="py-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No leads found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your search criteria or filter tags.'
              : 'Create your first lead to begin tracking prospect outreach.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile-Friendly Cards View (default on small screens or toggleable) */}
          <div className={`${viewMode === 'cards' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5' : 'hidden'}`}>
            {filteredLeads.map((lead) => {
              const assignedUser = users.find((u) => u.id === lead.assignedToId);
              return (
                <Card key={lead.id} className="hover:border-indigo-300 dark:hover:border-indigo-600 transition shadow-xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4
                          onClick={() => onViewLead(lead.id)}
                          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer truncate text-sm"
                        >
                          {lead.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 block mt-0.5">{lead.source || 'Direct Outreach'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {getStatusBadge(lead.status)}
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${getScoreColor(lead.score)}`}>
                          {lead.score}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                      {lead.email && (
                        <div className="flex items-center space-x-2 truncate">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center space-x-2 truncate">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <div className="flex items-center space-x-1.5 text-slate-500">
                        {assignedUser ? (
                          <div className="flex items-center space-x-1">
                            <span className="h-4 w-4 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[9px]">
                              {assignedUser.name.charAt(0)}
                            </span>
                            <span className="truncate max-w-[100px]">{assignedUser.name}</span>
                          </div>
                        ) : (
                          <span className="italic">Unassigned</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewLead(lead.id)}
                          className="h-7 w-7 text-slate-500 hover:text-indigo-600"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditLead(lead)}
                          className="h-7 w-7 text-slate-500 hover:text-slate-900"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteLead(lead.id)}
                          className="h-7 w-7 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Full Table View with Horizontal Scroll Protection */}
          <div className={`${viewMode === 'table' ? 'block' : 'hidden'}`}>
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Channel Source</TableHead>
                  <TableHead>Assigned Rep</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => {
                  const assignedUser = users.find((u) => u.id === lead.assignedToId);
                  return (
                    <TableRow key={lead.id} className="group">
                      <TableCell>
                        <div
                          className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer"
                          onClick={() => onViewLead(lead.id)}
                        >
                          {lead.name}
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-400">
                          {lead.email && (
                            <span className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{lead.email}</span>
                            </span>
                          )}
                          {lead.phone && (
                            <span className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{lead.phone}</span>
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${getScoreColor(lead.score)}`}>
                          {lead.score} / 100
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {lead.source || 'Direct Outreach'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {assignedUser ? (
                          <div className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                              {assignedUser.name.charAt(0)}
                            </div>
                            <span>{assignedUser.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewLead(lead.id)}
                            title="View Details"
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditLead(lead)}
                            title="Edit Lead"
                            className="h-8 w-8 text-slate-500 hover:text-slate-900"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteLead(lead.id)}
                            title="Delete Lead"
                            className="h-8 w-8 text-slate-400 hover:text-rose-600"
                          >
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
        </>
      )}
    </div>
  );
}
