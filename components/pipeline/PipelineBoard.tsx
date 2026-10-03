'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { Deal, DealStage, User, Customer } from '../../types/index.ts';
import { StageColumn } from './StageColumn.tsx';
import { DealCard } from './DealCard.tsx';
import { Button } from '../ui/Button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { dealSchema } from '../../lib/validations/dealSchema.ts';
import { Plus, Filter } from 'lucide-react';
import { formatCurrency } from '../../lib/utils.ts';

interface PipelineBoardProps {
  deals: Deal[];
  users: User[];
  customers: Customer[];
  onUpdateDealStage: (dealId: string, newStage: DealStage) => Promise<void> | void;
  onCreateDeal: (data: any) => Promise<void> | void;
  onViewDeal?: (id: string) => void;
}

const STAGES: Array<{ key: DealStage; label: string }> = [
  { key: 'QUALIFIED', label: 'Qualified' },
  { key: 'PROPOSAL', label: 'Proposal' },
  { key: 'NEGOTIATION', label: 'Negotiation' },
  { key: 'WON', label: 'Closed Won' },
  { key: 'LOST', label: 'Closed Lost' },
];

export function PipelineBoard({
  deals,
  users,
  customers,
  onUpdateDealStage,
  onCreateDeal,
  onViewDeal,
}: PipelineBoardProps) {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultStage, setDefaultStage] = useState<DealStage>('QUALIFIED');
  const [filterRep, setFilterRep] = useState<string>('ALL');
  const [mobileActiveStage, setMobileActiveStage] = useState<DealStage | 'ALL'>('ALL');

  // Form State
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [probability, setProbability] = useState(50);
  const [customerId, setCustomerId] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    if (deal) {
      setActiveDeal(deal);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;

    // Check if dropped onto a stage column directly
    const isStage = STAGES.some((s) => s.key === overId);
    let targetStage: DealStage | null = null;

    if (isStage) {
      targetStage = overId as DealStage;
    } else {
      // Dropped onto another deal card
      const targetDeal = deals.find((d) => d.id === overId);
      if (targetDeal) {
        targetStage = targetDeal.stage;
      }
    }

    if (targetStage) {
      const currentDeal = deals.find((d) => d.id === dealId);
      if (currentDeal && currentDeal.stage !== targetStage) {
        onUpdateDealStage(dealId, targetStage);
      }
    }
  };

  const handleOpenAdd = (stage: DealStage = 'QUALIFIED') => {
    setDefaultStage(stage);
    setTitle('');
    setValue('');
    setProbability(50);
    setCustomerId(customers[0]?.id || '');
    setAssignedToId(users[0]?.id || '');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const parsed = dealSchema.safeParse({
      title,
      value: Number(value),
      stage: defaultStage,
      probability: Number(probability),
      customerId: customerId || null,
      assignedToId: assignedToId || null,
    });

    if (!parsed.success) {
      const errs: Record<string, string> = {};
      const issues = (parsed.error as any).issues || (parsed.error as any).errors || [];
      issues.forEach((err: any) => {
        if (err.path && err.path[0]) errs[err.path[0] as string] = err.message;
      });
      setFormErrors(errs);
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreateDeal(parsed.data);
      setIsModalOpen(false);
    } catch (err: any) {
      setFormErrors({ form: err.message || 'Failed to create deal' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDeals = deals.filter((deal) => {
    if (filterRep === 'ALL') return true;
    return deal.assignedToId === filterRep;
  });

  const totalPipelineValue = filteredDeals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Active Sales Pipeline</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total Pipeline:{' '}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(totalPipelineValue)}
            </span>{' '}
            across {filteredDeals.length} deals
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex-1 sm:flex-initial">
            <Filter className="h-3.5 w-3.5 text-slate-400 ml-1.5 shrink-0" />
            <select
              value={filterRep}
              onChange={(e) => setFilterRep(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-2 w-full sm:w-auto"
            >
              <option value="ALL">All Sales Reps</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={() => handleOpenAdd('QUALIFIED')} size="sm" className="space-x-1.5 shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">New Opportunity</span>
            <span className="xs:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Mobile Stage Selector Tabs (< sm) */}
      <div className="sm:hidden flex items-center space-x-1 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setMobileActiveStage('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            mobileActiveStage === 'ALL'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Stages ({filteredDeals.length})
        </button>
        {STAGES.map((s) => {
          const count = filteredDeals.filter((d) => d.stage === s.key).length;
          const isActive = mobileActiveStage === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setMobileActiveStage(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Board with dnd-kit */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {STAGES.filter((s) => mobileActiveStage === 'ALL' || mobileActiveStage === s.key).map((s) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === s.key);
            return (
              <div key={s.key} className="snap-start flex-1 min-w-[270px] sm:min-w-[280px] md:min-w-0">
                <StageColumn
                  stage={s.key}
                  label={s.label}
                  deals={stageDeals}
                  users={users}
                  customers={customers}
                  onAddDeal={handleOpenAdd}
                  onViewDeal={onViewDeal}
                  onMoveStage={(dealId, next) => onUpdateDealStage(dealId, next)}
                />
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal ? (
            <DealCard
              deal={activeDeal}
              assignedUser={users.find((u) => u.id === activeDeal.assignedToId)}
              customer={customers.find((c) => c.id === activeDeal.customerId)}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add Deal Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader onClose={() => setIsModalOpen(false)}>
            <DialogTitle>Add Opportunity to Pipeline</DialogTitle>
            <DialogDescription>
              Create a new qualified deal with estimated contract value and probability.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {formErrors.form && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                {formErrors.form}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Deal Title *
              </label>
              <Input
                placeholder="e.g. Enterprise Cloud Annual Contract"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={formErrors.title}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Value ($ USD) *
                </label>
                <Input
                  type="number"
                  placeholder="25000"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  error={formErrors.value}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Pipeline Stage
                </label>
                <Select
                  value={defaultStage}
                  onChange={(e) => setDefaultStage(e.target.value as DealStage)}
                >
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL">Proposal</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="WON">Closed Won</option>
                  <option value="LOST">Closed Lost</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Customer Account
                </label>
                <Select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Select Customer (Optional)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned Account Executive
                </label>
                <Select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Win Probability: <span className="text-indigo-600 font-bold">{probability}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-slate-700"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Save Deal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
