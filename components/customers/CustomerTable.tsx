import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Card, CardContent } from '../ui/Card.tsx';
import { Customer, Deal, Ticket } from '../../types/index.ts';
import { formatDate, formatCurrency } from '../../lib/utils.ts';
import { Search, Plus, Edit2, Trash2, ExternalLink, Building, Mail, Phone, LayoutGrid, List } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  deals: Deal[];
  tickets: Ticket[];
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onViewCustomer: (id: string) => void;
  isLoading?: boolean;
}

export function CustomerTable({
  customers,
  deals,
  tickets,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onViewCustomer,
  isLoading = false,
}: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filtered = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(searchTerm))
    );
  });

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search accounts by company, contact, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center space-x-2">
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

          <Button onClick={onAddCustomer} size="sm" className="space-x-1.5 shrink-0">
            <Plus className="h-4 w-4" />
            <span>New Customer</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <span className="text-sm">Loading customer directory...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No customers found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'Add your first customer account to begin managing relations.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className={`${viewMode === 'cards' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5' : 'hidden'}`}>
            {filtered.map((customer) => {
              const customerDeals = deals.filter((d) => d.customerId === customer.id);
              const customerTickets = tickets.filter((t) => t.customerId === customer.id);
              const totalVal = customerDeals.reduce((sum, d) => sum + d.value, 0);

              return (
                <Card key={customer.id} className="hover:border-indigo-300 dark:hover:border-indigo-600 transition shadow-xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4
                          onClick={() => onViewCustomer(customer.id)}
                          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer truncate text-sm flex items-center space-x-1.5"
                        >
                          <Building className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">{customer.company || customer.name}</span>
                        </h4>
                        {customer.company && customer.name && (
                          <span className="text-xs text-slate-400 block mt-0.5 truncate">{customer.name} (Contact)</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        {formatCurrency(totalVal)}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                      {customer.email && (
                        <div className="flex items-center space-x-2 truncate">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center space-x-2 truncate">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <div className="flex items-center space-x-2 text-slate-500">
                        <span>{customerDeals.length} deals</span>
                        <span>•</span>
                        <span className={customerTickets.length > 0 ? 'text-amber-600 font-semibold' : ''}>
                          {customerTickets.length} tickets
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewCustomer(customer.id)}
                          className="h-7 w-7 text-slate-500 hover:text-indigo-600"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditCustomer(customer)}
                          className="h-7 w-7 text-slate-500 hover:text-slate-900"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteCustomer(customer.id)}
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

          {/* Table view with horizontal scroll */}
          <div className={`${viewMode === 'table' ? 'block' : 'hidden'}`}>
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Account</TableHead>
                  <TableHead>Contact Information</TableHead>
                  <TableHead>Active Deals</TableHead>
                  <TableHead>Total Deal Value</TableHead>
                  <TableHead>Support Tickets</TableHead>
                  <TableHead>Customer Since</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((customer) => {
                  const customerDeals = deals.filter((d) => d.customerId === customer.id);
                  const customerTickets = tickets.filter((t) => t.customerId === customer.id);
                  const totalVal = customerDeals.reduce((sum, d) => sum + d.value, 0);

                  return (
                    <TableRow key={customer.id} className="group">
                      <TableCell>
                        <div
                          className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer flex items-center space-x-1.5"
                          onClick={() => onViewCustomer(customer.id)}
                        >
                          <Building className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span>{customer.company || customer.name}</span>
                        </div>
                        {customer.company && customer.name && (
                          <span className="text-xs text-slate-400 block ml-5.5">{customer.name} (Primary Contact)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                          {customer.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span>{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {customerDeals.length}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(totalVal)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            customerTickets.length > 0
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {customerTickets.length} open
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(customer.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewCustomer(customer.id)}
                            title="View Customer Profile"
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditCustomer(customer)}
                            title="Edit Customer"
                            className="h-8 w-8 text-slate-500 hover:text-slate-900"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteCustomer(customer.id)}
                            title="Delete Customer"
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
