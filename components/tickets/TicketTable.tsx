'use client';

import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Card, CardContent } from '../ui/Card.tsx';
import { Ticket, TicketStatus, Priority, Customer, User } from '../../types/index.ts';
import { formatDate } from '../../lib/utils.ts';
import { Search, Plus, Edit2, Trash2, ExternalLink, Filter, Building, LayoutGrid, List } from 'lucide-react';

interface TicketTableProps {
  tickets: Ticket[];
  customers: Customer[];
  users: User[];
  onAddTicket: () => void;
  onEditTicket: (ticket: Ticket) => void;
  onDeleteTicket: (id: string) => void;
  onViewTicket: (id: string) => void;
  isLoading?: boolean;
}

export function TicketTable({
  tickets,
  customers,
  users,
  onAddTicket,
  onEditTicket,
  onDeleteTicket,
  onViewTicket,
  isLoading = false,
}: TicketTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filtered = tickets.filter((t) => {
    const customer = customers.find((c) => c.id === t.customerId);
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="cyan">Open</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning">In Progress</Badge>;
      case 'WAITING':
        return <Badge variant="purple">Waiting</Badge>;
      case 'RESOLVED':
        return <Badge variant="success">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'HIGH':
        return <Badge variant="warning">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="default">Medium</Badge>;
      case 'LOW':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search tickets by subject, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <Filter className="h-3.5 w-3.5 text-slate-400 ml-1.5 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING">Waiting</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer px-2"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Cards view"
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

          <Button onClick={onAddTicket} size="sm" className="space-x-1.5 shrink-0">
            <Plus className="h-4 w-4" />
            <span>Create Ticket</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <span className="text-sm">Loading support tickets...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No support tickets found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'Try adjusting your search criteria or filter tags.'
              : 'Create your first ticket to begin tracking customer requests.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className={`${viewMode === 'cards' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5' : 'hidden'}`}>
            {filtered.map((ticket) => {
              const customer = customers.find((c) => c.id === ticket.customerId);
              const assignedUser = users.find((u) => u.id === ticket.assignedToId);

              return (
                <Card key={ticket.id} className="hover:border-indigo-300 dark:hover:border-indigo-600 transition shadow-xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4
                          onClick={() => onViewTicket(ticket.id)}
                          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer truncate text-sm"
                        >
                          {ticket.subject}
                        </h4>
                        {customer && (
                          <span className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5 truncate">
                            <Building className="h-3 w-3 shrink-0" />
                            <span className="truncate">{customer.company || customer.name}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      {ticket.description}
                    </p>

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
                          onClick={() => onViewTicket(ticket.id)}
                          className="h-7 w-7 text-slate-500 hover:text-indigo-600"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditTicket(ticket)}
                          className="h-7 w-7 text-slate-500 hover:text-slate-900"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteTicket(ticket.id)}
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

          {/* Table View */}
          <div className={`${viewMode === 'table' ? 'block' : 'hidden'}`}>
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket Subject</TableHead>
                  <TableHead>Linked Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned Support</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ticket) => {
                  const customer = customers.find((c) => c.id === ticket.customerId);
                  const assignedUser = users.find((u) => u.id === ticket.assignedToId);

                  return (
                    <TableRow key={ticket.id} className="group">
                      <TableCell>
                        <div
                          className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer line-clamp-1"
                          onClick={() => onViewTicket(ticket.id)}
                        >
                          {ticket.subject}
                        </div>
                        <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {ticket.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        {customer ? (
                          <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{customer.company || customer.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No account linked</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
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
                        {formatDate(ticket.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewTicket(ticket.id)}
                            title="View Ticket"
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditTicket(ticket)}
                            title="Edit Ticket"
                            className="h-8 w-8 text-slate-500 hover:text-slate-900"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteTicket(ticket.id)}
                            title="Delete Ticket"
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
