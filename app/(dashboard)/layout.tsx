'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '../../components/layout/Sidebar.tsx';
import { Topbar } from '../../components/layout/Topbar.tsx';
import { Toaster } from '../../components/ui/Sonner.tsx';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentOrgId, setCurrentOrgId] = useState('org_acme');
  const organizations = [
    { id: 'org_acme', name: 'Acme Technologies Inc.' },
    { id: 'org_apex', name: 'Apex Global Software' },
    { id: 'org_stellar', name: 'Stellar Cloud Systems' },
  ];

  const currentOrg = organizations.find((o) => o.id === currentOrgId) || organizations[0];

  const currentUser = {
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@acme.io',
    role: 'ADMIN',
    organizationName: currentOrg.name,
  };

  const getPageTitle = () => {
    if (pathname.includes('/leads/')) return 'Lead Overview';
    if (pathname.includes('/deals/')) return 'Opportunity Details';
    if (pathname.includes('/customers/')) return 'Customer Intelligence';
    if (pathname.includes('/tickets/')) return 'Ticket Management';
    if (pathname.includes('/settings/team')) return 'Team & Access Control';

    const segment = pathname.split('/').filter(Boolean).pop() || 'dashboard';
    return segment;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        currentPath={pathname}
        onNavigate={(path) => router.push(path)}
        user={currentUser}
        onLogout={() => router.push('/login')}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={getPageTitle()}
          organizations={organizations}
          currentOrgId={currentOrgId}
          onSelectOrg={setCurrentOrgId}
          onOpenQuickCreate={(type) => {
            if (type === 'lead') router.push('/leads');
            if (type === 'deal') router.push('/pipeline');
            if (type === 'ticket') router.push('/tickets');
          }}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
