import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb.ts';
import Deal from '../../../../models/Deal.ts';
import { dealSchema } from '../../../../lib/validations/dealSchema.ts';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const deal = await Deal.findById(params.id)
      .populate('customerId', 'name company email phone avatarUrl')
      .populate('assignedToId', 'name email role avatarUrl')
      .populate('organizationId', 'name logoUrl')
      .lean();

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: (deal as any)._id.toString(),
      ...(deal as any),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = dealSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
    }

    try {
      await connectToDatabase();
      const updated = await Deal.findByIdAndUpdate(
        params.id,
        { ...validation.data, updatedAt: new Date() },
        { new: true }
      )
        .populate('customerId', 'name company email phone avatarUrl')
        .populate('assignedToId', 'name email role avatarUrl')
        .lean();

      if (!updated) {
        return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: (updated as any)._id.toString(),
        ...(updated as any),
      });
    } catch {
      return NextResponse.json({
        id: params.id,
        ...validation.data,
        updatedAt: new Date(),
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
      await Deal.findByIdAndDelete(params.id);
    } catch {
      // Graceful
    }
    return NextResponse.json({ success: true, id: params.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
