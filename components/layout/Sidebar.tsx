import React from 'react';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Building2,
  Ticket,
  CheckSquare,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  Building,
  X,
} from 'lucide-react';
import { Badge } from '../ui/Badge.tsx';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  user?: {
    name: string;
    email: string;
    role: string;
    organizationName?: string;
  };
  onLogout?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  currentPath,
  onNavigate,
  user,
  onLogout,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Leads', path: '/leads', icon: Users },
    { label: 'Pipeline', path: '/pipeline', icon: Kanban },
    { label: 'Customers', path: '/customers', icon: Building2 },
    { label: 'Tickets', path: '/tickets', icon: Ticket },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-full">
      {/* Brand & Organization */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-2.5 cursor-pointer"
            onClick={() => handleNavClick('/dashboard')}
          >
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <Kanban className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
                Wordbit<span className="text-indigo-600">X</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                Enterprise Suite
              </span>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Tenant Organization Indicator */}
        <div className="mt-3 p-2 rounded-md bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <Building className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
              {user?.organizationName || 'Acme Technologies Inc.'}
            </span>
          </div>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 shrink-0">
            TENANT
          </Badge>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 font-semibold dark:bg-indigo-950/70 dark:text-indigo-400'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Team Sub-link under Settings */}
        <div className="pt-2 pl-3">
          <button
            type="button"
            onClick={() => handleNavClick('/settings/team')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentPath === '/settings/team'
                ? 'text-indigo-600 font-semibold dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>Team & Roles (Admin)</span>
          </button>
        </div>
      </nav>

      {/* User profile footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-850">
          <div className="min-w-0 flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate">{user?.name || 'User'}</p>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-400 truncate max-w-[100px] sm:max-w-none">{user?.email || 'user@example.com'}</span>
                <span className="inline-block px-1 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  {user?.role || 'SALES'}
                </span>
              </div>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onLogout();
              }}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 flex-col shrink-0 min-h-screen sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800 flex flex-col lg:hidden transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
