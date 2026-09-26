import React, { useEffect, useState } from 'react';
import { Order, OrderItem, Deal, Customer, User, Priority } from '../../types/index.ts';
import { orderSchema } from '../../lib/validations/orderSchema.ts';
import { calculateItem, calculateOrderTotals } from './orderMath.ts';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Plus, Trash2 } from 'lucide-react';

interface OrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order | null;
  customers: Customer[];
  deals: Deal[];
  users: User[];
  currentUser: User;
  seedDeal?: Deal | null;
  onSubmit: (data: any) => Promise<void> | void;
}

const dateValue = (value?: Date | string | null) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return Number.isNaN(date.getTime()) ? '' : local.toISOString().slice(0, 10);
};
const makeItem = (): OrderItem => ({ id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, name: '', description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 });

export function OrderForm({ open, onOpenChange, order, customers, deals, users, currentUser, seedDeal, onSubmit }: OrderFormProps) {
  const [customerId, setCustomerId] = useState('');
  const [company, setCompany] = useState('');
  const [dealId, setDealId] = useState('');
  const [sourceDealHandoffId, setSourceDealHandoffId] = useState('');
  const [salespersonId, setSalespersonId] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [status, setStatus] = useState<Order['status']>('DRAFT');
  const [items, setItems] = useState<OrderItem[]>([makeItem()]);
  const [additionalCharges, setAdditionalCharges] = useState('0');
  const [paidAmount, setPaidAmount] = useState('0');
  const [deliveryStatus, setDeliveryStatus] = useState<Order['deliveryStatus']>('NOT_STARTED');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (order) {
      setCustomerId(order.customerId);
      setCompany(order.company || '');
      setDealId(order.dealId || '');
      setSourceDealHandoffId(order.sourceDealHandoffId || '');
      setSalespersonId(order.salespersonId || '');
      setOrderDate(dateValue(order.orderDate));
      setExpectedDelivery(dateValue(order.expectedDelivery));
      setPaymentDueDate(dateValue(order.paymentDueDate));
      setPriority(order.priority);
      setStatus(order.status);
      setItems(order.items.length ? order.items : [makeItem()]);
      setAdditionalCharges(String(order.additionalCharges));
      setPaidAmount(String(order.paidAmount));
      setDeliveryStatus(order.deliveryStatus);
      setDeliveryDate(dateValue(order.deliveryDate));
      setShippingMethod(order.shippingMethod || '');
      setTrackingNumber(order.trackingNumber || '');
      setDeliveryAddress(order.deliveryAddress || '');
      setDeliveryNotes(order.deliveryNotes || '');
      setNotes('');
    } else {
      const relatedCustomer = customers.find((customer) => customer.id === seedDeal?.customerId);
      const sourceHandoff = seedDeal?.orderHandoff;
      setCustomerId(relatedCustomer?.id || customers[0]?.id || '');
      setCompany(seedDeal?.company || relatedCustomer?.company || '');
      setDealId(seedDeal?.id || '');
      setSourceDealHandoffId(sourceHandoff?.id || seedDeal?.id || '');
      setSalespersonId(seedDeal?.assignedToId || currentUser.id);
      setOrderDate(new Date().toISOString().slice(0, 10));
      setExpectedDelivery('');
      setPaymentDueDate('');
      setPriority(seedDeal?.priority || 'MEDIUM');
      setStatus('DRAFT');
      setItems(seedDeal ? [{ ...makeItem(), name: seedDeal.title, description: 'Created from won deal', quantity: 1, unitPrice: seedDeal.value }] : [makeItem()]);
      setAdditionalCharges('0'); setPaidAmount('0');
      setDeliveryStatus('NOT_STARTED'); setDeliveryDate(''); setShippingMethod(''); setTrackingNumber('');
      setDeliveryAddress([relatedCustomer?.address, relatedCustomer?.city, relatedCustomer?.state, relatedCustomer?.postalCode, relatedCustomer?.country].filter(Boolean).join(', '));
      setDeliveryNotes(''); setNotes('');
    }
    setErrors({});
  }, [open, order, seedDeal, customers, currentUser]);

  const totals = calculateOrderTotals(items, Number(additionalCharges) || 0, Number(paidAmount) || 0);
  const selectedCustomer = customers.find((customer) => customer.id === customerId);
  const linkedDeals = deals.filter((deal) => deal.customerId === customerId);
  const updateItem = (id: string, key: keyof OrderItem, value: string) => setItems((current) => current.map((item) => item.id === id ? { ...item, [key]: ['quantity', 'unitPrice', 'discount', 'tax'].includes(key) ? Number(value) || 0 : value } : item));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setErrors({});
    const result = orderSchema.safeParse({
      customerId, company, dealId: dealId || null, sourceDealHandoffId: sourceDealHandoffId || null,
      salespersonId: salespersonId || null, orderDate, expectedDelivery: expectedDelivery || null, paymentDueDate: paymentDueDate || null, priority, status,
      items, additionalCharges: Number(additionalCharges) || 0, paidAmount: Number(paidAmount) || 0,
      deliveryStatus, deliveryDate: deliveryDate || null, shippingMethod, trackingNumber, deliveryAddress, deliveryNotes, notes,
    });
    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.issues.forEach((issue) => { if (issue.path[0]) next[String(issue.path[0])] = issue.message; });
      setErrors(next); return;
    }
    const calculated = calculateOrderTotals(result.data.items, result.data.additionalCharges, result.data.paidAmount);
    try {
      setIsSubmitting(true);
      await onSubmit({ ...result.data, ...calculated, company: result.data.company || selectedCustomer?.company || null });
      onOpenChange(false);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Unable to save this order.' });
    } finally { setIsSubmitting(false); }
  };

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-5xl"><DialogHeader onClose={() => onOpenChange(false)}><DialogTitle>{order ? `Edit ${order.id}` : seedDeal ? 'Create order from won deal' : 'Create order'}</DialogTitle><DialogDescription>Set customer, items, pricing, and fulfillment details. Totals update automatically.</DialogDescription></DialogHeader>
    <form onSubmit={submit} className="space-y-5">{errors.form && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{errors.form}</div>}
      {seedDeal && <div className="flex flex-wrap items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"><Badge variant="success">Won deal</Badge><span>{seedDeal.title} · {formatOrderCurrency(seedDeal.value, seedDeal.currency || 'USD')} prefilled. Review and edit before creating the order.</span></div>}
      <section className="space-y-3"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Order information</h3><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Customer *" error={errors.customerId}><Select value={customerId} onChange={(event) => { const customer = customers.find((entry) => entry.id === event.target.value); setCustomerId(event.target.value); setCompany(customer?.company || ''); setDeliveryAddress([customer?.address, customer?.city, customer?.state, customer?.postalCode, customer?.country].filter(Boolean).join(', ')); }}><option value="">Select customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</Select></Field>
        <Field label="Company"><Input value={company} onChange={(event) => setCompany(event.target.value)} /></Field>
        <Field label="Related deal"><Select value={dealId} onChange={(event) => setDealId(event.target.value)}><option value="">No deal</option>{linkedDeals.map((deal) => <option key={deal.id} value={deal.id}>{deal.title}</option>)}</Select></Field>
        <Field label="Salesperson"><Select value={salespersonId} onChange={(event) => setSalespersonId(event.target.value)}><option value="">Unassigned</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</Select></Field>
        <Field label="Order date *" error={errors.orderDate}><Input type="date" value={orderDate} onChange={(event) => setOrderDate(event.target.value)} /></Field>
        <Field label="Expected delivery"><Input type="date" value={expectedDelivery} onChange={(event) => setExpectedDelivery(event.target.value)} /></Field>
        <Field label="Payment due"><Input type="date" value={paymentDueDate} onChange={(event) => setPaymentDueDate(event.target.value)} /></Field>
        <Field label="Priority"><Select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((value) => <option key={value}>{value}</option>)}</Select></Field>
        <Field label="Order status"><Select disabled={Boolean(order)} value={status} onChange={(event) => setStatus(event.target.value as Order['status'])}>{(order ? [order.status] : ['DRAFT', 'PENDING']).map((value) => <option key={value}>{value}</option>)}</Select></Field>
      </div></section>

      <section className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Order items</h3>{errors.items && <p className="mt-1 text-xs text-rose-500">{errors.items}</p>}</div><Button type="button" size="sm" variant="outline" onClick={() => setItems((current) => [...current, makeItem()])}><Plus className="mr-1 h-4 w-4" />Add item</Button></div>
        <div className="space-y-3">{items.map((item, index) => <div key={item.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">Item {index + 1}</span><Button type="button" size="icon" variant="ghost" title="Remove item" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}><Trash2 className="h-4 w-4 text-rose-500" /></Button></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7"><Field label="Product / service"><Input value={item.name} onChange={(event) => updateItem(item.id, 'name', event.target.value)} placeholder="Product name" /></Field><Field label="Description" className="col-span-2 xl:col-span-2"><Input value={item.description} onChange={(event) => updateItem(item.id, 'description', event.target.value)} /></Field><Field label="Quantity"><Input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', event.target.value)} /></Field><Field label="Unit price"><Input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(item.id, 'unitPrice', event.target.value)} /></Field><Field label="Discount %"><Input type="number" min="0" max="100" step="0.01" value={item.discount} onChange={(event) => updateItem(item.id, 'discount', event.target.value)} /></Field><Field label="Tax %"><Input type="number" min="0" max="100" step="0.01" value={item.tax} onChange={(event) => updateItem(item.id, 'tax', event.target.value)} /></Field></div><div className="mt-2 text-right text-xs text-slate-500">Line total <strong className="ml-1 text-slate-900 dark:text-white">{formatOrderCurrency(calculateItem(item).total, 'USD')}</strong></div></div>)}</div>
      </section>

      <section className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 lg:grid-cols-2"><div className="space-y-3"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Delivery / fulfillment</h3><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field label="Delivery status"><Select value={deliveryStatus} onChange={(event) => setDeliveryStatus(event.target.value as Order['deliveryStatus'])}>{[['NOT_STARTED', 'Not started'], ['PROCESSING', 'Processing'], ['READY', 'Ready'], ['SHIPPED', 'Shipped'], ['DELIVERED', 'Delivered'], ['FAILED', 'Failed']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field><Field label="Delivery date"><Input type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} /></Field><Field label="Shipping method"><Input value={shippingMethod} onChange={(event) => setShippingMethod(event.target.value)} /></Field><Field label="Tracking number"><Input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} /></Field><Field label="Delivery address" className="sm:col-span-2"><Input value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} /></Field><Field label="Delivery notes" className="sm:col-span-2"><textarea rows={2} value={deliveryNotes} onChange={(event) => setDeliveryNotes(event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" /></Field></div></div>
        <div className="space-y-3"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Order totals</h3><div className="space-y-2 rounded-md border border-slate-200 p-4 dark:border-slate-800">{[['Subtotal', totals.subtotal], ['Discount', -totals.discount], ['Tax', totals.tax]].map(([label, value]) => <div key={String(label)} className="flex justify-between text-sm text-slate-500"><span>{label}</span><span>{formatOrderCurrency(Number(value), 'USD')}</span></div>)}<Field label="Shipping / additional charges"><Input type="number" min="0" step="0.01" value={additionalCharges} onChange={(event) => setAdditionalCharges(event.target.value)} /></Field><div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-semibold dark:border-slate-800"><span>Grand total</span><span>{formatOrderCurrency(totals.total, 'USD')}</span></div><Field label="Paid amount"><Input type="number" min="0" max={totals.total} step="0.01" value={paidAmount} onChange={(event) => setPaidAmount(event.target.value)} /></Field><div className="flex justify-between text-sm"><span className="text-slate-500">Remaining</span><strong className="text-rose-600">{formatOrderCurrency(totals.remainingAmount, 'USD')}</strong></div></div></div>
      </section>
      <Field label="Internal notes"><textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" /></Field>
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" isLoading={isSubmitting}>{order ? 'Save order' : 'Create order'}</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) { return <label className={`block min-w-0 space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300 ${className || ''}`}><span>{label}</span>{children}{error && <span className="block text-xs text-rose-500">{error}</span>}</label>; }
function formatOrderCurrency(amount: number, currency: string) { return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount); }

export default OrderForm;
