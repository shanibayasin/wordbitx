import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb.ts';
import Task from '../../../models/Task.ts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organizationId') || 'org_acme';

    try {
      await connectToDatabase();
      const tasks = await Task.find({ organizationId: orgId })
        .populate('assignedToId', 'name email role avatarUrl')
        .sort({ createdAt: -1 })
        .lean();

      const formatted = tasks.map((t: any) => ({
        id: t._id.toString(),
        title: t.title,
        dueDate: t.dueDate,
        completed: t.completed,
        organizationId: t.organizationId.toString(),
        assignedToId: t.assignedToId?._id?.toString() || null,
        assignedTo: t.assignedToId || null,
        createdAt: t.createdAt,
      }));

      return NextResponse.json(formatted);
    } catch {
      return NextResponse.json([]);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body.organizationId || 'org_acme';

    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    try {
      await connectToDatabase();
      const newTask = await Task.create({
        title: body.title,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        completed: Boolean(body.completed),
        organizationId: orgId,
        assignedToId: body.assignedToId || null,
      });

      return NextResponse.json(
        {
          id: newTask._id.toString(),
          title: newTask.title,
          dueDate: newTask.dueDate,
          completed: newTask.completed,
          organizationId: orgId,
          assignedToId: newTask.assignedToId?.toString() || null,
          createdAt: newTask.createdAt,
        },
        { status: 201 }
      );
    } catch {
      return NextResponse.json(
        {
          id: `task_${Date.now()}`,
          title: body.title,
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          completed: Boolean(body.completed),
          organizationId: orgId,
          assignedToId: body.assignedToId || null,
          createdAt: new Date(),
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create task' }, { status: 500 });
  }
}
