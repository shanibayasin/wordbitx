'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { Customer, CustomerStatus, CustomerType, User } from '../../types/index.ts';
import { customerSchema } from '../../lib/validations/customerSchema.ts';
import { ImageUpload } from '../shared/ImageUpload.tsx';

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void> | void;
  customer?: Customer | null;
  users?: User[];
}

type CustomerFormState = Record<string, string> & {
  customerType: CustomerType;
  status: CustomerStatus;
};

const EMPTY_FORM: CustomerFormState = {
  firstName: '', lastName: '', name: '', email: '', phone: '', alternatePhone: '', company: '',
  jobTitle: '', industry: '', companySize: '', website: '', address: '', city: '', state: '',
  country: '', postalCode: '', customerType: 'ENTERPRISE', status: 'ACTIVE', source: '',
  assignedToId: '', assignedTeam: '', assignedDealer: '', tags: '', notes: '',
};

const fieldSections = [
  { title: 'Personal information', fields: [['firstName', 'First name *'], ['lastName', 'Last name *'], ['email', 'Email'], ['phone', 'Phone'], ['alternatePhone', 'Alternate phone']] },
  { title: 'Company information', fields: [['company', 'Company name'], ['jobTitle', 'Job title'], ['industry', 'Industry'], ['companySize', 'Company size'], ['website', 'Website']] },
  { title: 'Address', fields: [['address', 'Address'], ['city', 'City'], ['state', 'State / Province'], ['country', 'Country'], ['postalCode', 'Postal code']] },
] as const;

export function CustomerForm({ open, onOpenChange, onSubmit, customer, users = [] }: CustomerFormProps) {
  const [form, setForm] = useState<CustomerFormState>(EMPTY_FORM);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!customer) {
      setForm(EMPTY_FORM);
      setAvatarUrl(null);
      setErrors({});
      return;
    }
    const parts = customer.name.trim().split(/\s+/);
    setForm({
      ...EMPTY_FORM,
      firstName: customer.firstName || parts[0] || '',
      lastName: customer.lastName || parts.slice(1).join(' '),
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      alternatePhone: customer.alternatePhone || '',
      company: customer.company || '',
      jobTitle: customer.jobTitle || '',
      industry: customer.industry || '',
      companySize: customer.companySize || '',
      website: customer.website || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      country: customer.country || '',
      postalCode: customer.postalCode || '',
      customerType: customer.customerType || 'ENTERPRISE',
      status: customer.status || 'ACTIVE',
      source: customer.source || '',
      assignedToId: customer.assignedToId || '',
      assignedTeam: customer.assignedTeam || '',
      assignedDealer: customer.assignedDealer || '',
      tags: (customer.tags || []).join(', '),
      notes: customer.notes || '',
    });
    setAvatarUrl(customer.avatarUrl || null);
    setErrors({});
  }, [customer, open]);

  const setField = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    const result = customerSchema.safeParse({
      ...form,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      avatarUrl,
    });
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) nextErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(result.data);
      onOpenChange(false);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Failed to save customer' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>{customer ? 'Edit customer' : 'Add customer'}</DialogTitle>
          <DialogDescription>Maintain contact, account, and ownership details in one profile.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.form && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{errors.form}</div>}
          <div className="flex items-center gap-4">
            <ImageUpload value={avatarUrl} onChange={setAvatarUrl} onRemove={() => setAvatarUrl(null)} avatarMode folder="customers" label="Customer photo" />
            <p className="text-xs text-slate-500">Optional customer or company image</p>
          </div>
          {fieldSections.map((section) => (
            <section key={section.title} className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{section.title}</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {section.fields.map(([key, label]) => (
                  <label key={key} className="space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span>{label}</span>
                    <Input type={key === 'email' ? 'email' : key === 'website' ? 'url' : 'text'} value={form[key] || ''} onChange={(event) => setField(key, event.target.value)} error={errors[key]} />
                  </label>
                ))}
              </div>
            </section>
          ))}
          <section className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">CRM information</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">Customer type
                <Select value={form.customerType} onChange={(event) => setField('customerType', event.target.value)}>
                  <option value="INDIVIDUAL">Individual</option><option value="SMB">Small business</option><option value="MID_MARKET">Mid-market</option><option value="ENTERPRISE">Enterprise</option><option value="STRATEGIC">Strategic</option>
                </Select>
              </label>
              <label className="space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">Status
                <Select value={form.status} onChange={(event) => setField('status', event.target.value)}>
                  <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="PROSPECT">Prospect</option><option value="VIP">VIP</option><option value="AT_RISK">At risk</option><option value="ARCHIVED">Archived</option>
                </Select>
              </label>
              <label className="space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">Assigned salesperson
                <Select value={form.assignedToId} onChange={(event) => setField('assignedToId', event.target.value)}>
                  <option value="">Unassigned</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                </Select>
              </label>
              {(['assignedTeam', 'assignedDealer', 'source'] as const).map((key) => (
                <label key={key} className="space-y-1 text-xs font-medium capitalize text-slate-600 dark:text-slate-300">{key === 'source' ? 'Customer source' : key === 'assignedTeam' ? 'Assigned team' : 'Assigned dealer'}
                  <Input value={form[key]} onChange={(event) => setField(key, event.target.value)} />
                </label>
              ))}
              <label className="space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300 sm:col-span-2">Tags <span className="font-normal text-slate-400">(comma separated)</span>
                <Input value={form.tags} onChange={(event) => setField('tags', event.target.value)} placeholder="VIP, Enterprise, High Value" />
              </label>
              <label className="space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300 sm:col-span-2">Notes
                <textarea rows={3} value={form.notes} onChange={(event) => setField('notes', event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" />
              </label>
            </div>
          </section>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>{customer ? 'Save customer' : 'Create customer'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CustomerForm;