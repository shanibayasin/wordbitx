import { z } from 'zod';

export const dealSchema = z.object({
  title: z.string().min(2, { message: 'Deal title must be at least 2 characters' }).trim(),
  value: z.coerce.number().min(0, { message: 'Deal value must be positive' }),
  currency: z.enum(['USD', 'CAD', 'EUR', 'GBP']).default('USD'),
  company: z.string().optional().nullable(),
  pipeline: z.string().default('Sales Pipeline'),
  stage: z.enum(['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).default('NEW'),
  probability: z.coerce.number().min(0).max(100).default(50),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['OPEN', 'WON', 'LOST']).optional(),
  assignedToId: z.string().optional().nullable(),
  assignedTeam: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  expectedCloseDate: z.string().optional().nullable(),
  nextFollowUp: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional().nullable(),
  lossReason: z.enum(['Price', 'Competitor', 'No Budget', 'Not Interested', 'Timing', 'Other']).optional().nullable(),
  lossNotes: z.string().optional().nullable(),
}).superRefine((deal, context) => {
  if (deal.stage === 'LOST' && !deal.lossReason) {
    context.addIssue({ code: 'custom', path: ['lossReason'], message: 'Select a reason for losing this deal' });
  }
});

export type DealFormValues = z.infer<typeof dealSchema>;
