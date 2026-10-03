import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb.ts';
import Order from '../../../../models/Order.ts';
import { orderSchema } from '../../../../lib/validations/orderSchema.ts';
import { calculateOrderTotals, getNextOrderStatuses, getPaymentStatus } from '../../../../components/orders/orderMath.ts';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectToDatabase();
    const order = await Order.findById(id)
      .populate('customerId', 'name company email phone address city state country postalCode')
      .populate('dealId', 'title value stage probability assignedToId expectedCloseDate')
      .populate('salespersonId', 'name email role')
      .lean();
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({
      ...(order as any),
      id: (order as any)._id.toString(),
      organizationId: (order as any).organizationId.toString(),
      customerId: (order as any).customerId?._id?.toString() || (order as any).customerId?.toString(),
      dealId: (order as any).dealId?._id?.toString() || (order as any).dealId?.toString() || null,
      salespersonId: (order as any).salespersonId?._id?.toString() || (order as any).salespersonId?.toString() || null,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load order' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = orderSchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    await connectToDatabase();
    const current: any = await Order.findById(id).lean();
    if (!current) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const now = new Date();
    const update: Record<string, any> = { ...parsed.data, updatedAt: now, lastActivityAt: now };
    if (parsed.data.status && parsed.data.status !== current.status) {
      if (parsed.data.status === 'CANCELLED' && !body.cancellationReason) {
        return NextResponse.json({ error: 'Cancellation reason is required' }, { status: 400 });
      }
      if (parsed.data.status !== 'CANCELLED' && parsed.data.status !== 'REFUNDED' && !getNextOrderStatuses(current.status as any).includes(parsed.data.status as any)) {
        return NextResponse.json({ error: `Invalid order status transition: ${current.status} to ${parsed.data.status}` }, { status: 409 });
      }
      if (parsed.data.status === 'REFUNDED' && (current.status !== 'COMPLETED' || current.paidAmount <= 0)) {
        return NextResponse.json({ error: 'Only completed orders with recorded payments can be refunded' }, { status: 409 });
      }
      const actor = typeof body.changedBy === 'string' ? body.changedBy : 'System';
      update.activities = [{
        id: `activity_${now.getTime()}`,
        type: parsed.data.status === 'CONFIRMED' ? 'CONFIRMED' : parsed.data.status === 'PROCESSING' ? 'PROCESSING' : parsed.data.status === 'READY' ? 'READY' : parsed.data.status === 'COMPLETED' ? 'COMPLETED' : 'UPDATED',
        description: parsed.data.status === 'CANCELLED' ? `Order cancelled: ${body.cancellationReason}` : `Order status changed to ${parsed.data.status}`,
        user: actor,
        createdAt: now,
      }, ...(current.activities || [])];
    }
    if (parsed.data.items || parsed.data.additionalCharges !== undefined || parsed.data.paidAmount !== undefined) {
      const items = parsed.data.items || current.items;
      const charges = parsed.data.additionalCharges ?? current.additionalCharges;
      const paid = parsed.data.paidAmount ?? current.paidAmount;
      const totals = calculateOrderTotals(items as any, charges, paid);
      Object.assign(update, totals, { paymentStatus: getPaymentStatus(totals.total, totals.paidAmount, parsed.data.paymentDueDate || current.paymentDueDate) });
    }
    if (parsed.data.status === 'CANCELLED') {
      update.cancellationReason = body.cancellationReason || current.cancellationReason;
      update.cancellationNotes = body.cancellationNotes || null;
    }
    if (parsed.data.status === 'REFUNDED') {
      if (!body.refundReason || !Number.isFinite(Number(body.refundAmount)) || Number(body.refundAmount) <= 0 || Number(body.refundAmount) > current.paidAmount) {
        return NextResponse.json({ error: 'Valid refund amount and reason are required' }, { status: 400 });
      }
      const amount = Number(body.refundAmount);
      const fullyRefunded = amount >= current.paidAmount;
      update.refundAmount = (current.refundAmount || 0) + amount;
      update.refundDate = now;
      update.refundReason = body.refundReason;
      update.refundStatus = fullyRefunded ? 'COMPLETED' : 'PENDING';
      update.paidAmount = Math.max(0, current.paidAmount - amount);
      update.remainingAmount = Math.max(0, current.total - update.paidAmount);
      update.paymentStatus = fullyRefunded ? 'REFUNDED' : getPaymentStatus(current.total, update.paidAmount, current.paymentDueDate);
      update.status = fullyRefunded ? 'REFUNDED' : current.status;
    }

    const updated = await Order.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate('customerId', 'name company email phone')
      .populate('dealId', 'title value stage')
      .populate('salespersonId', 'name email')
      .lean();
    return NextResponse.json({ ...(updated as any), id: (updated as any)._id.toString() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update order' }, { status: 500 });
  }
}
