'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { Ticket, TicketStatus, Priority, Customer, User } from '../../types/index.ts';
import { ticketSchema } from '../../lib/validations/ticketSchema.ts';
import { ImageUpload } from '../shared/ImageUpload.tsx';
import { Paperclip, Trash2 } from 'lucide-react';

interface TicketFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void> | void;
  ticket?: Ticket | null;
  customers: Customer[];
  users: User[];
}

export function TicketForm({
  open,
  onOpenChange,
  onSubmit,
  ticket,
  customers,
  users,
}: TicketFormProps) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TicketStatus>('OPEN');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [customerId, setCustomerId] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ticket) {
      setSubject(ticket.subject);
      setDescription(ticket.description);
      setStatus(ticket.status);
      setPriority(ticket.priority);
      setCustomerId(ticket.customerId || '');
      setAssignedToId(ticket.assignedToId || '');
      setAttachments(ticket.attachments || []);
    } else {
      setSubject('');
      setDescription('');
      setStatus('OPEN');
      setPriority('MEDIUM');
      setCustomerId(customers[0]?.id || '');
      setAssignedToId('');
      setAttachments([]);
    }
    setNewAttachmentUrl('');
    setErrors({});
  }, [ticket, open]);

  const handleAddAttachment = (url: string) => {
    if (url) {
      setAttachments((prev) => [...prev, url]);
      setNewAttachmentUrl('');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = ticketSchema.safeParse({
      subject,
      description,
      status,
      priority,
      customerId: customerId || null,
      assignedToId: assignedToId || null,
      attachments,
    });

    if (!result.success) {
      const errs: Record<string, string> = {};
      const issues = (result.error as any).issues || (result.error as any).errors || [];
      issues.forEach((err: any) => {
        if (err.path && err.path[0]) errs[err.path[0] as string] = err.message;
      });
      setErrors(errs);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(result.data);
      onOpenChange(false);
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save ticket' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>{ticket ? 'Edit Support Ticket' : 'Create Support Ticket'}</DialogTitle>
          <DialogDescription>
            {ticket
              ? 'Update ticket priority, resolution status, or assigned engineer.'
              : 'Log an issue, feature request, or inquiry for customer resolution.'}
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
              Subject *
            </label>
            <Input
              placeholder="e.g. SSO SAML authentication intermittent failure"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              error={errors.subject}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              placeholder="Detailed reproduction steps or incident log..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Status
              </label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING">Waiting on Client</option>
                <option value="RESOLVED">Resolved</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Priority
              </label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (SLA 1h)</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Customer Account
              </label>
              <Select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">Select Account (Optional)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company || c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Assigned Support Engineer
              </label>
              <Select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
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

          {/* Cloudinary Ticket Attachments */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Paperclip className="h-3.5 w-3.5 text-slate-400" />
              <span>Ticket Screenshots / Incident Logs (Cloudinary)</span>
            </label>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {attachments.map((url, idx) => (
                  <div key={idx} className="relative group border rounded-lg overflow-hidden h-14 w-14 bg-slate-100">
                    <img src={url} alt="Attachment" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <ImageUpload
              value={newAttachmentUrl}
              onChange={(url) => handleAddAttachment(url)}
              folder="tickets"
              label=""
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {ticket ? 'Save Changes' : 'Submit Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TicketForm;
