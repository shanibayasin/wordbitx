'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { Lead, User } from '../../types/index.ts';
import { leadSchema } from '../../lib/validations/leadSchema.ts';

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void> | void;
  lead?: Lead | null;
  users: User[];
}

export function LeadForm({ open, onOpenChange, onSubmit, lead, users }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website',
    score: 50,
    status: 'NEW',
    assignedToId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email || '',
        phone: lead.phone || '',
        source: lead.source || 'Website',
        score: lead.score || 50,
        status: lead.status || 'NEW',
        assignedToId: lead.assignedToId || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        source: 'Website',
        score: 50,
        status: 'NEW',
        assignedToId: '',
      });
    }
    setErrors({});
  }, [lead, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = leadSchema.safeParse({
      ...formData,
      assignedToId: formData.assignedToId ? formData.assignedToId : null,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      const issues = (result.error as any).issues || (result.error as any).errors || [];
      issues.forEach((err: any) => {
        if (err.path && err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(result.data);
      onOpenChange(false);
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save lead' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>{lead ? 'Edit Prospect Lead' : 'Create New Lead'}</DialogTitle>
          <DialogDescription>
            {lead
              ? 'Update the prospect contact details, qualification score, and assigned sales rep.'
              : 'Add a new prospect to your multi-tenant sales pipeline repository.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
              {errors.form}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Prospect Name *
            </label>
            <Input
              placeholder="e.g. Alex Morgan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email</label>
              <Input
                type="email"
                placeholder="alex@enterprise.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone</label>
              <Input
                placeholder="+1 (555) 342-9102"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Lead Source
              </label>
              <Select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              >
                <option value="Website">Website Form</option>
                <option value="LinkedIn">LinkedIn InMail</option>
                <option value="Conference">Industry Conference</option>
                <option value="Referral">Client Referral</option>
                <option value="Outbound">Cold Outbound</option>
                <option value="Partner">Tech Partner</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Lifecycle Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="NEW">New</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="LOST">Lost</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Score (0-100): <span className="text-indigo-600 font-bold">{formData.score}</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Assigned Sales Rep
              </label>
              <Select
                value={formData.assignedToId}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {lead ? 'Save Changes' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
