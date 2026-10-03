import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb.ts';
import Deal from '../../../../models/Deal.ts';
import { dealSchema } from '../../../../lib/validations/dealSchema.ts';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectToDatabase();
    const deal = await Deal.findById(id)
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const validation = dealSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
    }

    try {
      await connectToDatabase();
      const current: any = await Deal.findById(id).lean();
      if (!current) {
        return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
      }
      const changedAt = new Date();
      const stageChanged = Boolean(validation.data.stage && validation.data.stage !== current.stage);
      const updateData: any = { ...validation.data, updatedAt: changedAt, lastActivityAt: changedAt };
      if (stageChanged) {
        const nextStage = validation.data.stage!;
        const actor = typeof body.changedBy === 'string' ? body.changedBy : 'System';
        updateData.status = nextStage === 'WON' ? 'WON' : nextStage === 'LOST' ? 'LOST' : 'OPEN';
        updateData.probability = nextStage === 'WON' ? 100 : nextStage === 'LOST' ? 0 : validation.data.probability ?? current.probability;
        updateData.stageEnteredAt = changedAt;
        updateData.stageHistory = [...(current.stageHistory || []), {
          id: `stage_${changedAt.getTime()}`,
          fromStage: current.stage,
          toStage: nextStage,
          changedBy: actor,
          changedAt,
          timeInPreviousStageMs: Math.max(0, changedAt.getTime() - new Date(current.stageEnteredAt || current.updatedAt || current.createdAt).getTime()),
          lossReason: validation.data.lossReason || null,
          lossNotes: validation.data.lossNotes || null,
        }];
        updateData.activities = [{
          id: `activity_${changedAt.getTime()}`,
          type: nextStage === 'WON' ? 'WON' : nextStage === 'LOST' ? 'LOST' : 'STAGE_CHANGED',
          description: nextStage === 'LOST' ? `Deal marked lost: ${validation.data.lossReason}` : nextStage === 'WON' ? 'Deal marked won' : `Stage changed from ${current.stage} to ${nextStage}`,
          user: actor,
          relatedEntity: 'Stage',
          createdAt: changedAt,
        }, ...(current.activities || [])];
      }
      const updated = await Deal.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
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
        id,
        ...validation.data,
        updatedAt: new Date(),
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    try {
      await connectToDatabase();
      await Deal.findByIdAndDelete(id);
    } catch {
      // Graceful
    }
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
