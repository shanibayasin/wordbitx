import { z } from 'zod';

export const leadSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }).trim().optional().or(z.literal('')),
  lastName: z.string().min(1, { message: 'Last name is required' }).trim().optional().or(z.literal('')),
  name: z.string().min(2, { message: 'Lead name must be at least 2 characters' }).trim(),
  company: z.string().min(1, { message: 'Company is required' }).trim().optional().or(z.literal('')),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  alternatePhone: z.string().optional().or(z.literal('')),
  source: z.string().optional().or(z.literal('')),
  industry: z.string().optional().or(z.literal('')),
  jobTitle: z.string().optional().or(z.literal('')),
  companySize: z.string().optional().or(z.literal('')),
  score: z.coerce.number().min(0).max(100).default(0),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED', 'LOST', 'FOLLOW_UP']).default('NEW'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignedToId: z.string().optional().nullable(),
  assignedTeam: z.string().optional().or(z.literal('')),
  assignedDealer: z.string().optional().or(z.literal('')),
  nextFollowUp: z.string().optional().or(z.literal('')),
  followUpType: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
