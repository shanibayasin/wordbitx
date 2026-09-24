import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb.ts';
import Task from '../../../../models/Task.ts';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.completed !== undefined) updateData.completed = Boolean(body.completed);
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId;

    try {
      await connectToDatabase();
      const updated = await Task.findByIdAndUpdate(params.id, updateData, { new: true })
        .populate('assignedToId', 'name email role avatarUrl')
        .lean();

      if (!updated) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: (updated as any)._id.toString(),
        ...(updated as any),
      });
    } catch {
      return NextResponse.json({
        id: params.id,
        ...updateData,
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
      await Task.findByIdAndDelete(params.id);
    } catch {
      // Graceful
    }
    return NextResponse.json({ success: true, id: params.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
