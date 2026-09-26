import { OrderItem, OrderStatus, PaymentStatus } from '../../types/index.ts';

export interface OrderTotals {
  subtotal: number;
  discount: number;
  tax: number;
  additionalCharges: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
}

export function calculateItem(item: OrderItem) {
  const subtotal = Math.max(0, item.quantity) * Math.max(0, item.unitPrice);
  const discount = subtotal * Math.min(100, Math.max(0, item.discount)) / 100;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * Math.min(100, Math.max(0, item.tax)) / 100;
  return { subtotal, discount, tax, total: roundMoney(taxableAmount + tax) };
}

export function calculateOrderTotals(items: OrderItem[], additionalCharges: number, paidAmount: number): OrderTotals {
  const itemTotals = items.map(calculateItem);
  const subtotal = itemTotals.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = itemTotals.reduce((sum, item) => sum + item.discount, 0);
  const tax = itemTotals.reduce((sum, item) => sum + item.tax, 0);
  const total = Math.max(0, roundMoney(subtotal - discount + tax + Math.max(0, additionalCharges)));
  const paid = Math.min(total, Math.max(0, paidAmount));
  return {
    subtotal: roundMoney(subtotal),
    discount: roundMoney(discount),
    tax: roundMoney(tax),
    additionalCharges: roundMoney(Math.max(0, additionalCharges)),
    total,
    paidAmount: roundMoney(paid),
    remainingAmount: roundMoney(Math.max(0, total - paid)),
  };
}

export function getPaymentStatus(total: number, paidAmount: number, dueDate?: Date | string | null, refunded = false): PaymentStatus {
  if (refunded) return 'REFUNDED';
  if (paidAmount >= total && total > 0) return 'PAID';
  if (dueDate && new Date(dueDate).getTime() < Date.now()) return 'OVERDUE';
  if (paidAmount > 0) return 'PARTIAL';
  return 'UNPAID';
}

export function getNextOrderStatuses(status: OrderStatus): OrderStatus[] {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    DRAFT: ['PENDING', 'CANCELLED'],
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['READY'],
    READY: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
    REFUNDED: [],
  };
  return transitions[status];
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
