import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.string().min(1),
  productId: z.string().optional().nullable(),
  name: z.string().trim().min(1, { message: 'Item name is required' }),
  description: z.string().optional().default(''),
  quantity: z.coerce.number().positive({ message: 'Quantity must be greater than zero' }),
  unitPrice: z.coerce.number().min(0, { message: 'Unit price cannot be negative' }),
  discount: z.coerce.number().min(0).max(100).default(0),
  tax: z.coerce.number().min(0).max(100).default(0),
});

export const orderSchema = z.object({
  customerId: z.string().min(1, { message: 'Select a customer' }),
  company: z.string().optional().nullable(),
  dealId: z.string().optional().nullable(),
  sourceDealHandoffId: z.string().optional().nullable(),
  salespersonId: z.string().optional().nullable(),
  orderDate: z.string().min(1, { message: 'Order date is required' }),
  expectedDelivery: z.string().optional().nullable(),
  paymentDueDate: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED', 'REFUNDED']).default('DRAFT'),
  items: z.array(orderItemSchema).min(1, { message: 'Add at least one order item' }),
  additionalCharges: z.coerce.number().min(0).default(0),
  paidAmount: z.coerce.number().min(0).default(0),
  deliveryStatus: z.enum(['NOT_STARTED', 'PROCESSING', 'READY', 'SHIPPED', 'DELIVERED', 'FAILED']).default('NOT_STARTED'),
  deliveryDate: z.string().optional().nullable(),
  shippingMethod: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  deliveryAddress: z.string().optional().nullable(),
  deliveryNotes: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
