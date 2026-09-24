'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/Card.tsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table.tsx';
import { Button } from '../../../../components/ui/Button.tsx';
import { Badge } from '../../../../components/ui/Badge.tsx';
import { Input } from '../../../../components/ui/Input.tsx';
import { Select } from '../../../../components/ui/Select.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../components/ui/Dialog.tsx';
import { User, Role } from '../../../../types/index.ts';
import { formatDate } from '../../../../lib/utils.ts';
import { UserPlus, Trash2, Mail } from 'lucide-react';
import { toast } from '../../../../components/ui/Sonner.tsx';
import { ImageUpload } from '../../../../components/shared/ImageUpload.tsx';

const INITIAL_TEAM: User[] = [
  { id: 'usr_1', name: 'Sarah Jenkins', email: 'sarah.jenkins@acme.io', role: 'ADMIN', organizationId: 'org_acme', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', createdAt: new Date(Date.now() - 86400000 * 180) },
  { id: 'usr_2', name: 'Marcus Wright', email: 'marcus.wright@acme.io', role: 'SALES', organizationId: 'org_acme', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', createdAt: new Date(Date.now() - 86400000 * 120) },
  { id: 'usr_3', name: 'Elena Rostova', email: 'elena.rostova@acme.io', role: 'SALES', organizationId: 'org_acme', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80', createdAt: new Date(Date.now() - 86400000 * 90) },
  { id: 'usr_4', name: 'Devon Vance', email: 'devon.vance@acme.io', role: 'SUPPORT', organizationId: 'org_acme', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', createdAt: new Date(Date.now() - 86400000 * 60) },
  { id: 'usr_5', name: 'Claire Zhao', email: 'claire.zhao@acme.io', role: 'AGENT', organizationId: 'org_acme', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', createdAt: new Date(Date.now() - 86400000 * 30) },
];

export default function TeamSettingsPage() {
  const [team, setTeam] = useState<User[]>(INITIAL_TEAM);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('SALES');
  const [inviteAvatarUrl, setInviteAvatarUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (userId: string, newRole: Role) => {
    setTeam((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast.success('Team member role updated');
  };

  const handleRemoveMember = (userId: string) => {
    if (team.length <= 1) {
      toast.error('Cannot remove the last administrative member');
      return;
    }
    setTeam((prev) => prev.filter((u) => u.id !== userId));
    toast.success('Team member removed from workspace');
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error('Please enter name and valid email');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
        organizationId: 'org_acme',
        avatarUrl: inviteAvatarUrl || null,
        createdAt: new Date(),
      };
      setTeam((prev) => [...prev, newUser]);
      setIsInviteOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInviteRole('SALES');
      setInviteAvatarUrl(null);
      setIsSubmitting(false);
      toast.success(`Invitation sent to ${newUser.email}`);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Team & Role-Based Access Control
            </h1>
            <Badge variant="purple" className="text-xs">
              ADMIN ONLY
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Invite colleagues, designate departmental roles, upload Cloudinary avatars, and configure organization permissions.
          </p>
        </div>

        <Button onClick={() => setIsInviteOpen(true)} size="sm" className="space-x-1.5">
          <UserPlus className="h-4 w-4" />
          <span>Invite Member</span>
        </Button>
      </div>

      {/* Team Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Active Members ({team.length})</CardTitle>
          <CardDescription>
            Users belonging to this organization with active access credentials and Cloudinary profiles.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Assigned Role</TableHead>
                <TableHead>Joined Workspace</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2.5">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {member.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{member.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                      className="text-xs font-semibold py-1 px-2 rounded-md border border-slate-200 bg-white text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="SALES">SALES</option>
                      <option value="SUPPORT">SUPPORT</option>
                      <option value="AGENT">AGENT</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {formatDate(member.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader onClose={() => setIsInviteOpen(false)}>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Grant access to your organization's CRM workspace and assign their role.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div className="flex items-center space-x-3">
              <ImageUpload
                value={inviteAvatarUrl}
                onChange={(url) => setInviteAvatarUrl(url)}
                onRemove={() => setInviteAvatarUrl(null)}
                avatarMode={true}
                folder="avatars"
                label="Profile Picture"
              />
              <div className="text-xs text-slate-500">
                <span className="font-semibold block text-slate-700 dark:text-slate-300">Member Avatar</span>
                <span>Optional profile photo hosted via Cloudinary.</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name *
              </label>
              <Input
                placeholder="e.g. Rachel Adams"
                value={inviteName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Work Email *
              </label>
              <Input
                type="email"
                placeholder="rachel@acme.io"
                value={inviteEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Permission Role *
              </label>
              <Select
                value={inviteRole}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setInviteRole(e.target.value as Role)}
              >
                <option value="ADMIN">ADMIN - Full administrative access to pipeline, billing, & users</option>
                <option value="SALES">SALES - Manage opportunities, leads, and customer accounts</option>
                <option value="SUPPORT">SUPPORT - Manage customer tickets, issues, and SLAs</option>
                <option value="AGENT">AGENT - General read & outreach permissions</option>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
