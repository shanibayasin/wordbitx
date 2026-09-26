import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb.ts';
import Order from '../../../models/Order.ts';
import { orderSchema } from '../../../lib/validations/orderSchema.ts';
import { calculateOrderTotals, getPaymentStatus } from '../../../components/orders/orderMath.ts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || 'org_acme';
    await connectToDatabase();
    const orders = await Order.find({ organizationId })
      .populate('customerId', 'name company email phone address city state country postalCode')
      .populate('dealId', 'title value stage probability assignedToId expectedCloseDate')
      .populate('salespersonId', 'name email role')
      .sort({ orderDate: -1 })
      .lean();
    return NextResponse.json(orders.map((order: any) => ({
      ...order,
      id: order._id.toString(),
      organizationId: order.organizationId.toString(),
      customerId: order.customerId?._id?.toString() || order.customerId?.toString(),
      dealId: order.dealId?._id?.toString() || order.dealId?.toString() || null,
      salespersonId: order.salespersonId?._id?.toString() || order.salespersonId?.toString() || null,
    })));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const organizationId = body.organizationId || 'org_acme';
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });

    const now = new Date();
    const totals = calculateOrderTotals(parsed.data.items, parsed.data.additionalCharges, parsed.data.paidAmount);
    const paymentStatus = getPaymentStatus(totals.total, totals.paidAmount, parsed.data.paymentDueDate);
    const { notes: noteText, ...orderData } = parsed.data;
    const created = await Order.create({
      ...orderData,
      ...totals,
      organizationId,
      paymentStatus,
      notes: noteText?.trim() ? [{ id: `note_${now.getTime()}`, content: noteText.trim(), author: body.createdBy || 'System', createdAt: now }] : [],
      activities: [{ id: `activity_${now.getTime()}`, type: 'CREATED', description: 'Order created', user: body.createdBy || 'System', createdAt: now }],
      invoiceReferences: [],
      paymentReferences: [],
      refundStatus: 'NONE',
      lastActivityAt: now,
    });
    return NextResponse.json({ ...created.toObject(), id: created._id.toString(), organizationId: created.organizationId.toString() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create order' }, { status: 500 });
  }
}
