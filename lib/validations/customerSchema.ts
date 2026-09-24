import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, { message: 'Customer contact name must be at least 2 characters' }).trim(),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  avatarUrl: z.string().optional().nullable(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
