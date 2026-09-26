'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Deal, User, Customer, DealStage } from '../../types/index.ts';
import { DealCard } from './DealCard.tsx';
import { formatCurrency } from '../../lib/utils.ts';
import { Plus } from 'lucide-react';

interface StageColumnProps {
  stage: DealStage;
  label: string;
  deals: Deal[];
  users: User[];
  customers: Customer[];
  totalValue?: number;
  weightedValue?: number;
  selectedIds?: string[];
  onToggleSelect?: (dealId: string) => void;
  onAddDeal?: (stage: DealStage) => void;
  onViewDeal?: (dealId: string) => void;
  onEditDeal?: (deal: Deal) => void;
  onMoveStage?: (dealId: string, next: DealStage) => void;
}

const STAGE_COLORS: Record<DealStage, string> = {
  NEW: 'bg-slate-400',
  QUALIFIED: 'bg-blue-500',
  PROPOSAL: 'bg-amber-500',
  NEGOTIATION: 'bg-purple-500',
  WON: 'bg-emerald-500',
  LOST: 'bg-rose-500',
};

const NEXT_STAGE: Partial<Record<DealStage, DealStage>> = {
  NEW: 'QUALIFIED',
  QUALIFIED: 'PROPOSAL',
  PROPOSAL: 'NEGOTIATION',
  NEGOTIATION: 'WON',
};

export function StageColumn({
  stage,
  label,
  deals,
  users,
  customers,
  totalValue: reportedTotalValue,
  weightedValue: reportedWeightedValue,
  selectedIds = [],
  onToggleSelect,
  onAddDeal,
  onViewDeal,
  onEditDeal,
  onMoveStage,
}: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const totalValue = reportedTotalValue ?? deals.reduce((sum, d) => sum + d.value, 0);
  const weightedValue = reportedWeightedValue ?? deals.reduce((sum, deal) => sum + deal.value * deal.probability / 100, 0);
  const colorDot = STAGE_COLORS[stage] || 'bg-slate-400';

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 p-3 w-full transition-colors ${
        isOver ? 'ring-2 ring-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <span className={`h-2.5 w-2.5 rounded-full ${colorDot}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {label}
          </h3>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {deals.length}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="text-right">
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400">{formatCurrency(totalValue)}</span>
            <span className="block text-[10px] text-slate-400">{formatCurrency(weightedValue)} weighted</span>
          </div>
          {onAddDeal && (
            <button
              type="button"
              onClick={() => onAddDeal(stage)}
              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
              title="Add deal to this stage"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 space-y-2.5 overflow-y-auto min-h-55 sm:min-h-87.5 max-h-[calc(100vh-280px)] pr-0.5">
        {deals.map((deal) => {
          const cust = customers.find((c) => c.id === deal.customerId);
          const rep = users.find((u) => u.id === deal.assignedToId);
          return (
            <DealCard
              key={deal.id}
              deal={deal}
              customer={cust}
              assignedUser={rep}
              isSelected={selectedIds.includes(deal.id)}
              onToggleSelect={onToggleSelect}
              onView={onViewDeal}
              onEdit={() => onEditDeal?.(deal)}
              onAdvance={onMoveStage ? (id, target) => {
                const nextStage = target === 'WON' || target === 'LOST' ? target : NEXT_STAGE[deal.stage];
                if (nextStage) onMoveStage(id, nextStage);
              } : undefined}
            />
          );
        })}

        {deals.length === 0 && (
          <div className="h-28 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-400">
            Drop deal here
          </div>
        )}
      </div>
    </div>
  );
}

export default StageColumn;
