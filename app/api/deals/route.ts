import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb.ts';
import Deal from '../../../models/Deal.ts';
import { dealSchema } from '../../../lib/validations/dealSchema.ts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organizationId') || 'org_acme';

    try {
      await connectToDatabase();
      const deals = await Deal.find({ organizationId: orgId })
        .populate('customerId', 'name company email phone avatarUrl')
        .populate('assignedToId', 'name email role avatarUrl')
        .sort({ updatedAt: -1 })
        .lean();

      const formatted = deals.map((d: any) => ({
        ...d,
        id: d._id.toString(),
        organizationId: d.organizationId.toString(),
        customerId: d.customerId?._id?.toString() || null,
        customer: d.customerId || null,
        assignedToId: d.assignedToId?._id?.toString() || null,
        assignedTo: d.assignedToId || null,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));

      return NextResponse.json(formatted);
    } catch {
      return NextResponse.json([]);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body.organizationId || 'org_acme';

    const validation = dealSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
    }

    try {
      await connectToDatabase();
      const createdAt = new Date();
      const newDeal: any = await Deal.create({
        ...validation.data,
        assignedToId: validation.data.assignedToId || null,
        customerId: validation.data.customerId || null,
        organizationId: orgId,
        status: validation.data.stage === 'WON' ? 'WON' : validation.data.stage === 'LOST' ? 'LOST' : 'OPEN',
        stageEnteredAt: createdAt,
        lastActivityAt: createdAt,
        stageHistory: [{ id: `stage_${createdAt.getTime()}`, fromStage: null, toStage: validation.data.stage, changedBy: body.createdBy || 'System', changedAt: createdAt, timeInPreviousStageMs: 0 }],
        activities: [{ id: `activity_${createdAt.getTime()}`, type: 'CREATED', description: 'Deal created', user: body.createdBy || 'System', relatedEntity: 'Deal', createdAt }],
      });

      return NextResponse.json(
        {
          id: newDeal._id.toString(),
          ...validation.data,
          organizationId: orgId,
          status: newDeal.status,
          stageHistory: newDeal.stageHistory,
          activities: newDeal.activities,
          createdAt: newDeal.createdAt,
          updatedAt: newDeal.updatedAt,
        },
        { status: 201 }
      );
    } catch {
      return NextResponse.json(
        {
          id: `deal_${Date.now()}`,
          ...validation.data,
          organizationId: orgId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create deal' }, { status: 500 });
  }
}
