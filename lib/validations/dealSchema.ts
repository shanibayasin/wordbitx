import { z } from 'zod';

export const dealSchema = z.object({
  title: z.string().min(2, { message: 'Deal title must be at least 2 characters' }).trim(),
  value: z.coerce.number().min(0, { message: 'Deal value must be positive' }),
  stage: z.enum(['QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).default('QUALIFIED'),
  probability: z.coerce.number().min(0).max(100).default(50),
  assignedToId: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
});

export type DealFormValues = z.infer<typeof dealSchema>;
