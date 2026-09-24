import { z } from 'zod';

export const ticketSchema = z.object({
  subject: z.string().min(3, { message: 'Ticket subject must be at least 3 characters' }).trim(),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED']).default('OPEN'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  customerId: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  attachments: z.array(z.string()).default([]),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;
