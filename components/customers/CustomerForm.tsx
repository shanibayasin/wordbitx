import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Customer } from '../../types/index.ts';
import { customerSchema } from '../../lib/validations/customerSchema.ts';
import { ImageUpload } from '../shared/ImageUpload.tsx';

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void> | void;
  customer?: Customer | null;
}

export function CustomerForm({ open, onOpenChange, onSubmit, customer }: CustomerFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setCompany(customer.company || '');
      setAvatarUrl(customer.avatarUrl || null);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setAvatarUrl(null);
    }
    setErrors({});
  }, [customer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = customerSchema.safeParse({
      name,
      email,
      phone,
      company,
      avatarUrl,
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
      setErrors({ form: err.message || 'Failed to save customer' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>{customer ? 'Edit Customer Account' : 'Add New Customer Account'}</DialogTitle>
          <DialogDescription>
            {customer
              ? 'Update the customer profile and corporate contact details.'
              : 'Add an enterprise account to link opportunities and support tickets.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
              {errors.form}
            </div>
          )}

          {/* Cloudinary Avatar Upload */}
          <div className="flex items-center space-x-4 pb-2">
            <ImageUpload
              value={avatarUrl}
              onChange={(url) => setAvatarUrl(url)}
              onRemove={() => setAvatarUrl(null)}
              avatarMode={true}
              folder="customers"
              label="Account / Brand Avatar"
            />
            <div className="text-xs text-slate-500">
              <span className="font-semibold block text-slate-700 dark:text-slate-300">Customer Picture</span>
              <span>Upload company logo or contact photo saved to Cloudinary.</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Company / Organization Name
            </label>
            <Input
              placeholder="e.g. Stripe, Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              error={errors.company}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Primary Contact Person *
            </label>
            <Input
              placeholder="e.g. Jordan Lee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Contact Email
              </label>
              <Input
                type="email"
                placeholder="jordan@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Contact Phone
              </label>
              <Input
                placeholder="+1 (555) 839-2049"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {customer ? 'Save Changes' : 'Create Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CustomerForm;
