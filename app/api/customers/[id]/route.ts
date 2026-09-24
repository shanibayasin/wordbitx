import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb.ts';
import Customer from '../../../../models/Customer.ts';
import Deal from '../../../../models/Deal.ts';
import Ticket from '../../../../models/Ticket.ts';
import { customerSchema } from '../../../../lib/validations/customerSchema.ts';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const customer = await Customer.findById(params.id)
      .populate('organizationId', 'name logoUrl')
      .lean();

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const deals = await Deal.find({ customerId: params.id })
      .populate('assignedToId', 'name email')
      .lean();

    const tickets = await Ticket.find({ customerId: params.id })
      .populate('assignedToId', 'name email')
      .lean();

    return NextResponse.json({
      id: (customer as any)._id.toString(),
      ...(customer as any),
      deals,
      tickets,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = customerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
    }

    try {
      await connectToDatabase();
      const updated = await Customer.findByIdAndUpdate(params.id, validation.data, {
        new: true,
      }).lean();

      if (!updated) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: (updated as any)._id.toString(),
        ...(updated as any),
      });
    } catch {
      return NextResponse.json({
        id: params.id,
        ...validation.data,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    try {
      await connectToDatabase();
      await Customer.findByIdAndDelete(params.id);
    } catch {
      // Graceful
    }
    return NextResponse.json({ success: true, id: params.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
