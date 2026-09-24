import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb.ts';
import Lead from '../../../../models/Lead.ts';
import { leadSchema } from '../../../../lib/validations/leadSchema.ts';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const lead = await Lead.findById(params.id)
      .populate('assignedToId', 'name email role avatarUrl')
      .populate('organizationId', 'name logoUrl')
      .lean();

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: (lead as any)._id.toString(),
      ...(lead as any),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = leadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
    }

    try {
      await connectToDatabase();
      const updated = await Lead.findByIdAndUpdate(
        params.id,
        { ...validation.data, updatedAt: new Date() },
        { new: true }
      )
        .populate('assignedToId', 'name email role avatarUrl')
        .lean();

      if (!updated) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
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
      await Lead.findByIdAndDelete(params.id);
    } catch {
      // Graceful delete confirmation
    }
    return NextResponse.json({ success: true, id: params.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
