'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Deal, User, Customer, DealStage } from '../../types/index.ts';
import { formatCurrency } from '../../lib/utils.ts';
import { Building, DollarSign, UserCheck, GripVertical } from 'lucide-react';

interface DealCardProps {
  deal: Deal;
  customer?: Customer | null;
  assignedUser?: User | null;
  isOverlay?: boolean;
  onView?: (dealId: string) => void;
  onAdvance?: (dealId: string, currentStage: DealStage) => void;
}

export function DealCard({
  deal,
  customer,
  assignedUser,
  isOverlay = false,
  onView,
  onAdvance,
}: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { deal },
    disabled: isOverlay,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-slate-900 border rounded-lg p-3.5 shadow-sm transition hover:shadow-md ${
        isDragging
          ? 'opacity-40 ring-2 ring-indigo-500 shadow-xl'
          : isOverlay
          ? 'ring-2 ring-indigo-500 shadow-2xl scale-105'
          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'
      }`}
    >
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <h4
          onClick={() => onView && onView(deal.id)}
          className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:text-indigo-600 transition"
        >
          {deal.title}
        </h4>
        {!isOverlay && (
          <div
            {...attributes}
            {...listeners}
            className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-0.5 rounded shrink-0"
            title="Drag opportunity"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      {customer && (
        <div className="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400 mb-2 truncate">
          <Building className="h-3 w-3 shrink-0 text-slate-400" />
          <span className="truncate">{customer.company || customer.name}</span>
        </div>
      )}

      {/* Progress & Probability */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span>Win Probability</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{deal.probability}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              deal.probability >= 70
                ? 'bg-emerald-500'
                : deal.probability >= 40
                ? 'bg-amber-500'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${deal.probability}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="font-extrabold text-slate-900 dark:text-white flex items-center">
          <DollarSign className="h-3.5 w-3.5 text-emerald-600 -mr-0.5" />
          <span>{formatCurrency(deal.value)}</span>
        </div>

        {assignedUser && (
          <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-medium">
            <UserCheck className="h-3 w-3" />
            <span className="truncate max-w-[80px]">{assignedUser.name.split(' ')[0]}</span>
          </div>
        )}
      </div>

      {/* Advance button */}
      {!isOverlay && deal.stage !== 'WON' && deal.stage !== 'LOST' && onAdvance && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdvance(deal.id, deal.stage);
          }}
          className="mt-2.5 w-full py-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded border border-indigo-100 dark:border-indigo-900 transition flex items-center justify-center space-x-1"
        >
          <span>Advance Stage →</span>
        </button>
      )}
    </div>
  );
}

export default DealCard;
