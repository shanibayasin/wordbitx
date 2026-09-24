'use client';

import React from 'react';
import { Card, CardContent } from '../ui/Card.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Lead, User } from '../../types/index.ts';
import { formatDate } from '../../lib/utils.ts';
import { Mail, Phone, Calendar, UserCheck, Flame } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  assignedUser?: User | null;
  onClick?: () => void;
}

export function LeadCard({ lead, assignedUser, onClick }: LeadCardProps) {
  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'QUALIFIED':
        return <Badge variant="success">Qualified</Badge>;
      case 'FOLLOW_UP':
        return <Badge variant="warning">Follow Up</Badge>;
      case 'NEW':
        return <Badge variant="default">New</Badge>;
      case 'LOST':
        return <Badge variant="destructive">Lost</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card
      onClick={onClick}
      className="p-4 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
          {lead.name}
        </h4>
        {getStatusBadge(lead.status)}
      </div>

      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
        {lead.email && (
          <div className="flex items-center space-x-1.5 truncate">
            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center space-x-1.5">
            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{lead.phone}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
        <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-semibold">
          <Flame className="h-3.5 w-3.5" />
          <span>Score: {lead.score}</span>
        </div>

        {assignedUser && (
          <div className="flex items-center space-x-1 text-slate-400">
            <UserCheck className="h-3.5 w-3.5" />
            <span className="truncate max-w-[90px]">{assignedUser.name}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default LeadCard;
