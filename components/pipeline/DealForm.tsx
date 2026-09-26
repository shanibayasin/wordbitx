import React, { useEffect, useState } from 'react';
import { Deal, DealStage, Customer, User } from '../../types/index.ts';
import { dealSchema } from '../../lib/validations/dealSchema.ts';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';

interface DealFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
  defaultStage?: DealStage;
  customers: Customer[];
  users: User[];
  onSubmit: (data: any) => Promise<void> | void;
}

type FormState = {
  title: string;
  value: string;
  currency: 'USD' | 'CAD' | 'EUR' | 'GBP';
  company: string;
  pipeline: string;
  stage: DealStage;
  probability: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'WON' | 'LOST';
  customerId: string;
  assignedToId: string;
  assignedTeam: string;
  expectedCloseDate: string;
  nextFollowUp: string;
  source: string;
  tags: string;
  notes: string;
  lossReason: string;
  lossNotes: string;
};

const DATE_VALUE = (value?: Date | string | null) => value ? new Date(value).toISOString().slice(0, 10) : '';
const EMPTY_FORM: FormState = {
  title: '', value: '', currency: 'USD', company: '', pipeline: 'Sales Pipeline', stage: 'NEW', probability: 50,
  priority: 'MEDIUM', status: 'OPEN', customerId: '', assignedToId: '', assignedTeam: '', expectedCloseDate: '',
  nextFollowUp: '', source: '', tags: '', notes: '', lossReason: '', lossNotes: '',
};

export function DealForm({ open, onOpenChange, deal, defaultStage = 'NEW', customers, users, onSubmit }: DealFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!deal) {
      setForm({ ...EMPTY_FORM, stage: defaultStage, customerId: customers[0]?.id || '', assignedToId: users[0]?.id || '' });
    } else {
      setForm({
        ...EMPTY_FORM,
        title: deal.title,
        value: String(deal.value),
        currency: (deal.currency || 'USD') as FormState['currency'],
        company: deal.company || customers.find((customer) => customer.id === deal.customerId)?.company || '',
        pipeline: deal.pipeline || 'Sales Pipeline',
        stage: deal.stage,
        probability: deal.probability,
        priority: deal.priority || 'MEDIUM',
        status: deal.status || (deal.stage === 'WON' ? 'WON' : deal.stage === 'LOST' ? 'LOST' : 'OPEN'),
        customerId: deal.customerId || '',
        assignedToId: deal.assignedToId || '',
        assignedTeam: deal.assignedTeam || '',
        expectedCloseDate: DATE_VALUE(deal.expectedCloseDate),
        nextFollowUp: DATE_VALUE(deal.nextFollowUp),
        source: deal.source || '',
        tags: (deal.tags || []).join(', '),
        notes: deal.notes || '',
        lossReason: deal.lossReason || '',
        lossNotes: deal.lossNotes || '',
      });
    }
    setErrors({});
  }, [open, deal, defaultStage, customers, users]);

  const update = (key: keyof FormState, value: string | number) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    const parsed = dealSchema.safeParse({
      ...form,
      value: Number(form.value),
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      customerId: form.customerId || null,
      assignedToId: form.assignedToId || null,
      expectedCloseDate: form.expectedCloseDate || null,
      nextFollowUp: form.nextFollowUp || null,
      lossReason: form.lossReason || null,
      lossNotes: form.lossNotes || null,
    });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { if (issue.path[0]) nextErrors[String(issue.path[0])] = issue.message; });
      setErrors(nextErrors);
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(parsed.data);
      onOpenChange(false);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Unable to save this deal.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl">
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>{deal ? 'Edit deal' : 'Add deal'}</DialogTitle>
        <DialogDescription>Manage the opportunity, forecast, ownership, and follow-up details.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-5">
        {errors.form && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{errors.form}</div>}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Deal details</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Deal name *" error={errors.title} className="sm:col-span-2"><Input value={form.title} onChange={(event) => update('title', event.target.value)} error={errors.title} placeholder="Enterprise annual contract" /></Field>
            <Field label="Customer" error={errors.customerId}><Select value={form.customerId} onChange={(event) => {
              const customer = customers.find((entry) => entry.id === event.target.value);
              setForm((current) => ({ ...current, customerId: event.target.value, company: customer?.company || current.company }));
            }}><option value="">Select customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}{customer.company ? ` · ${customer.company}` : ''}</option>)}</Select></Field>
            <Field label="Company"><Input value={form.company} onChange={(event) => update('company', event.target.value)} /></Field>
            <Field label="Deal value *" error={errors.value}><div className="flex gap-2"><Select aria-label="Currency" value={form.currency} onChange={(event) => update('currency', event.target.value)} className="w-24 shrink-0"><option>USD</option><option>CAD</option><option>EUR</option><option>GBP</option></Select><Input type="number" min="0" step="0.01" value={form.value} onChange={(event) => update('value', event.target.value)} error={errors.value} placeholder="0.00" /></div></Field>
            <Field label="Pipeline"><Input value={form.pipeline} onChange={(event) => update('pipeline', event.target.value)} /></Field>
            <Field label="Stage"><Select value={form.stage} onChange={(event) => update('stage', event.target.value)}><option value="NEW">New</option><option value="QUALIFIED">Qualified</option><option value="PROPOSAL">Proposal</option><option value="NEGOTIATION">Negotiation</option>{deal?.stage === 'WON' && <option value="WON">Won</option>}{deal?.stage === 'LOST' && <option value="LOST">Lost</option>}</Select></Field>
            <Field label="Priority"><Select value={form.priority} onChange={(event) => update('priority', event.target.value)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></Select></Field>
            <Field label={`Probability · ${form.probability}%`} error={errors.probability}><input type="range" min="0" max="100" step="5" value={form.probability} onChange={(event) => update('probability', Number(event.target.value))} className="mt-2 w-full accent-indigo-600" /></Field>
          </div>
        </section>
        <section className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Assignment and dates</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Salesperson"><Select value={form.assignedToId} onChange={(event) => update('assignedToId', event.target.value)}><option value="">Unassigned</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</Select></Field>
            <Field label="Team"><Input value={form.assignedTeam} onChange={(event) => update('assignedTeam', event.target.value)} /></Field>
            <Field label="Expected close"><Input type="date" value={form.expectedCloseDate} onChange={(event) => update('expectedCloseDate', event.target.value)} /></Field>
            <Field label="Next follow-up"><Input type="date" value={form.nextFollowUp} onChange={(event) => update('nextFollowUp', event.target.value)} /></Field>
            <Field label="Source"><Input value={form.source} onChange={(event) => update('source', event.target.value)} placeholder="Referral, inbound, event..." /></Field>
            <Field label="Tags · comma separated"><Input value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="Renewal, Strategic" /></Field>
            <Field label="Notes"><textarea rows={3} value={form.notes} onChange={(event) => update('notes', event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" /></Field>
            {form.stage === 'LOST' && <>
              <Field label="Loss reason *" error={errors.lossReason}><Select value={form.lossReason} onChange={(event) => update('lossReason', event.target.value)} error={errors.lossReason}><option value="">Select a reason</option>{['Price', 'Competitor', 'No Budget', 'Not Interested', 'Timing', 'Other'].map((reason) => <option key={reason}>{reason}</option>)}</Select></Field>
              <Field label="Loss notes"><textarea rows={3} value={form.lossNotes} onChange={(event) => update('lossNotes', event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" /></Field>
            </>}
          </div>
        </section>
        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" isLoading={isSubmitting}>{deal ? 'Save deal' : 'Create deal'}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return <label className={`block space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300 ${className || ''}`}><span>{label}</span>{children}{error && <span className="block text-xs text-rose-500">{error}</span>}</label>;
}
