import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().trim().optional().default(''),
  firstName: z.string().trim().optional().default(''),
  lastName: z.string().trim().optional().default(''),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  alternatePhone: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  jobTitle: z.string().optional().or(z.literal('')),
  industry: z.string().optional().or(z.literal('')),
  companySize: z.string().optional().or(z.literal('')),
  website: z.string().url({ message: 'Enter a valid website URL' }).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  customerType: z.enum(['INDIVIDUAL', 'SMB', 'MID_MARKET', 'ENTERPRISE', 'STRATEGIC']).default('ENTERPRISE'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT', 'VIP', 'AT_RISK', 'ARCHIVED']).default('ACTIVE'),
  source: z.string().optional().or(z.literal('')),
  assignedToId: z.string().optional().or(z.literal('')),
  assignedTeam: z.string().optional().or(z.literal('')),
  assignedDealer: z.string().optional().or(z.literal('')),
  tags: z.array(z.string().trim().min(1)).default([]),
  notes: z.string().optional().or(z.literal('')),
  avatarUrl: z.string().optional().nullable(),
}).refine(
  (value) => value.name.trim().length >= 2 || (value.firstName.trim().length > 0 && value.lastName.trim().length > 0),
  { message: 'Enter the customer name', path: ['firstName'] }
).transform((value) => ({
  ...value,
  name: `${value.firstName} ${value.lastName}`.trim() || value.name,
}));

export type CustomerFormValues = z.infer<typeof customerSchema>;
