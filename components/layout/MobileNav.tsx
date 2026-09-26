import React from 'react';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Building2,
  ShoppingCart,
  Ticket,
  Menu,
} from 'lucide-react';

interface MobileNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenMenu: () => void;
}

export function MobileNav({ currentPath, onNavigate, onOpenMenu }: MobileNavProps) {
  const tabs = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Leads', path: '/leads', icon: Users },
    { label: 'Pipeline', path: '/pipeline', icon: Kanban },
    { label: 'Orders', path: '/orders', icon: ShoppingCart },
    { label: 'Customers', path: '/customers', icon: Building2 },
    { label: 'Tickets', path: '/tickets', icon: Ticket },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 flex items-center justify-around safe-area-bottom shadow-lg"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPath === tab.path || currentPath.startsWith(tab.path + '/');
        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => onNavigate(tab.path)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition cursor-pointer flex-1 min-w-0 ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-md transition ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/70' : ''}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="truncate w-full text-center mt-0.5">{tab.label}</span>
          </button>
        );
      })}

      {/* More / Menu Drawer Toggle */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer flex-1 min-w-0"
      >
        <div className="p-1 rounded-md">
          <Menu className="h-4 w-4" />
        </div>
        <span className="truncate w-full text-center mt-0.5">More</span>
      </button>
    </nav>
  );
}
