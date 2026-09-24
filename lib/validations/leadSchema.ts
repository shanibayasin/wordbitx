import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().min(2, { message: 'Lead name must be at least 2 characters' }).trim(),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  source: z.string().optional().or(z.literal('')),
  score: z.coerce.number().min(0).max(100).default(0),
  status: z.enum(['NEW', 'FOLLOW_UP', 'QUALIFIED', 'LOST']).default('NEW'),
  assignedToId: z.string().optional().nullable(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
