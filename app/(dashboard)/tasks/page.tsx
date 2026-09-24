'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Task } from '../../../types/index.ts';
import { formatDate } from '../../../lib/utils.ts';
import { CheckCircle2, Circle, Calendar, Plus, Trash2, CheckSquare } from 'lucide-react';
import { toast } from '../../../components/ui/Sonner.tsx';

const INITIAL_TASKS: Task[] = [
  { id: 'task_1', title: 'Schedule Q4 contract renewal discussion with Jordan (Apex Global)', dueDate: new Date(Date.now() + 86400000 * 2), completed: false, organizationId: 'org_acme', assignedToId: 'usr_1', createdAt: new Date() },
  { id: 'task_2', title: 'Send updated MSA pricing proposal to Maya at CloudScale Networks', dueDate: new Date(Date.now() + 86400000 * 1), completed: false, organizationId: 'org_acme', assignedToId: 'usr_2', createdAt: new Date() },
  { id: 'task_3', title: 'Review IdP certificate configuration with DevOps team', dueDate: new Date(), completed: true, organizationId: 'org_acme', assignedToId: 'usr_4', createdAt: new Date() },
  { id: 'task_4', title: 'Compile monthly revenue cohort analytics for executive board', dueDate: new Date(Date.now() + 86400000 * 4), completed: false, organizationId: 'org_acme', assignedToId: 'usr_1', createdAt: new Date() },
  { id: 'task_5', title: 'Follow up on warm intro with Fintech Hub VP of Engineering', dueDate: new Date(Date.now() - 86400000 * 1), completed: true, organizationId: 'org_acme', assignedToId: 'usr_2', createdAt: new Date() },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = !t.completed;
          toast.success(updated ? 'Task marked as completed' : 'Task reopened');
          return { ...t, completed: updated };
        }
        return t;
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTitle.trim(),
      dueDate: newDueDate ? new Date(newDueDate) : null,
      completed: false,
      organizationId: 'org_acme',
      assignedToId: 'usr_1',
      createdAt: new Date(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle('');
    setNewDueDate('');
    toast.success('Task created successfully');
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success('Task deleted');
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Actionable Tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Keep track of sales outreach follow-ups, client meetings, and support resolutions.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          <CheckSquare className="h-4 w-4 mr-1 text-indigo-600" />
          <span>{completedCount} of {tasks.length} Completed</span>
        </div>
      </div>

      {/* Add Task Input Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder="What needs to get done next?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-44">
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" className="space-x-1 shrink-0">
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Checklist View */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Checklist</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100 dark:divide-slate-800 p-0">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-4 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                task.completed ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30' : ''
              }`}
            >
              <div
                className="flex items-center space-x-3 cursor-pointer select-none flex-1 min-w-0"
                onClick={() => handleToggle(task.id)}
              >
                <button
                  type="button"
                  className="text-slate-400 hover:text-indigo-600 shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <span
                  className={`text-sm font-medium ${
                    task.completed
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {task.title}
                </span>
              </div>

              <div className="flex items-center space-x-3 shrink-0 ml-4">
                {task.dueDate && (
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  className="text-slate-400 hover:text-rose-600 transition p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
