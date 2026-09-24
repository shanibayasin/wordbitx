import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb.ts';
import Lead from '../../../models/Lead.ts';
import { leadSchema } from '../../../lib/validations/leadSchema.ts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organizationId') || 'org_acme';

    try {
      await connectToDatabase();
      const leads = await Lead.find({ organizationId: orgId })
        .populate('assignedToId', 'name email role avatarUrl')
        .sort({ createdAt: -1 })
        .lean();

      const formatted = leads.map((l: any) => ({
        id: l._id.toString(),
        name: l.name,
        email: l.email,
        phone: l.phone,
        source: l.source,
        score: l.score,
        status: l.status,
        organizationId: l.organizationId.toString(),
        assignedToId: l.assignedToId?._id?.toString() || null,
        assignedTo: l.assignedToId || null,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      }));

      return NextResponse.json(formatted);
    } catch {
      return NextResponse.json([]);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body.organizationId || 'org_acme';

    const validation = leadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
    }

    try {
      await connectToDatabase();
      const newLead: any = await Lead.create({
        ...validation.data,
        assignedToId: validation.data.assignedToId || null,
        organizationId: orgId,
      });

      return NextResponse.json(
        {
          id: newLead._id.toString(),
          ...validation.data,
          organizationId: orgId,
          createdAt: newLead.createdAt,
          updatedAt: newLead.updatedAt,
        },
        { status: 201 }
      );
    } catch {
      return NextResponse.json(
        {
          id: `lead_${Date.now()}`,
          ...validation.data,
          organizationId: orgId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create lead' }, { status: 500 });
  }
}
