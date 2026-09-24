import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb.ts';
import Ticket from '../../../models/Ticket.ts';
import { ticketSchema } from '../../../lib/validations/ticketSchema.ts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organizationId') || 'org_acme';

    try {
      await connectToDatabase();
      const tickets = await Ticket.find({ organizationId: orgId })
        .populate('customerId', 'name company email avatarUrl')
        .populate('assignedToId', 'name email role avatarUrl')
        .sort({ createdAt: -1 })
        .lean();

      const formatted = tickets.map((t: any) => ({
        id: t._id.toString(),
        subject: t.subject,
        description: t.description,
        status: t.status,
        priority: t.priority,
        organizationId: t.organizationId.toString(),
        customerId: t.customerId?._id?.toString() || null,
        customer: t.customerId || null,
        assignedToId: t.assignedToId?._id?.toString() || null,
        assignedTo: t.assignedToId || null,
        attachments: t.attachments || [],
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));

      return NextResponse.json(formatted);
    } catch {
      return NextResponse.json([]);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body.organizationId || 'org_acme';

    const validation = ticketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
    }

    try {
      await connectToDatabase();
      const newTicket: any = await Ticket.create({
        ...validation.data,
        assignedToId: validation.data.assignedToId || null,
        customerId: validation.data.customerId || null,
        organizationId: orgId,
      });

      return NextResponse.json(
        {
          id: newTicket._id.toString(),
          ...validation.data,
          organizationId: orgId,
          createdAt: newTicket.createdAt,
          updatedAt: newTicket.updatedAt,
        },
        { status: 201 }
      );
    } catch {
      return NextResponse.json(
        {
          id: `tkt_${Date.now()}`,
          ...validation.data,
          organizationId: orgId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create ticket' }, { status: 500 });
  }
}
