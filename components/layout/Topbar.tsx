import React, { useState } from 'react';
import { Search, Bell, Plus, Shield, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';

interface TopbarProps {
  title: string;
  onOpenQuickCreate?: (type: 'lead' | 'deal' | 'ticket') => void;
  organizationName?: string;
  onSwitchTenant?: () => void;
  organizations?: Array<{ id: string; name: string }>;
  currentOrgId?: string;
  onSelectOrg?: (orgId: string) => void;
  onToggleMobileSidebar?: () => void;
}

export function Topbar({
  title,
  onOpenQuickCreate,
  organizations = [],
  currentOrgId,
  onSelectOrg,
  onToggleMobileSidebar,
}: TopbarProps) {
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur px-3 sm:px-6 flex items-center justify-between dark:bg-slate-900/95 dark:border-slate-800 sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Menu Toggle + Title */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition -ml-1"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="min-w-0 flex items-center space-x-2">
          <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white capitalize truncate">
            {title.replace('-', ' ')}
          </h1>
          <Badge variant="outline" className="text-[10px] font-medium hidden md:inline-flex shrink-0">
            <Shield className="h-3 w-3 mr-1 text-emerald-500" /> Multi-Tenant
          </Badge>
        </div>
      </div>

      {/* Center Search (Tablet & Desktop) */}
      <div className="hidden md:flex items-center max-w-xs w-full mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, deals, tickets..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 transition"
          />
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="absolute inset-x-0 top-0 h-14 bg-white dark:bg-slate-900 px-3 flex items-center z-40 md:hidden border-b border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search leads, deals, tickets..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(false)}
            className="ml-2 p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Right Action Items */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
        {/* Mobile Search Toggle Button */}
        <button
          type="button"
          onClick={() => setIsMobileSearchOpen(true)}
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          title="Search"
          aria-label="Open search bar"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Tenant Organization Switcher */}
        {organizations.length > 0 && onSelectOrg && (
          <div className="flex items-center space-x-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold hidden xl:inline">Org:</span>
            <select
              value={currentOrgId}
              onChange={(e) => onSelectOrg(e.target.value)}
              className="text-[11px] sm:text-xs font-semibold py-1 sm:py-1.5 px-1.5 sm:px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[110px] sm:max-w-[160px] md:max-w-none truncate"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Create Action Button */}
        {onOpenQuickCreate && (
          <div className="relative">
            <Button
              size="sm"
              onClick={() => setIsQuickCreateOpen((prev) => !prev)}
              className="space-x-1 shadow-sm px-2.5 sm:px-3 h-8 sm:h-9"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New</span>
              <ChevronDown className="h-3 w-3 ml-0.5 opacity-70 hidden sm:inline" />
            </Button>

            {isQuickCreateOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsQuickCreateOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl dark:bg-slate-900 dark:border-slate-800 z-50 animate-in fade-in-50 zoom-in-95">
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickCreateOpen(false);
                      onOpenQuickCreate('lead');
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center space-x-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="font-medium">Add Lead</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickCreateOpen(false);
                      onOpenQuickCreate('deal');
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center space-x-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-medium">Add Deal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickCreateOpen(false);
                      onOpenQuickCreate('ticket');
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center space-x-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-medium">Submit Ticket</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Notifications */}
        <button
          type="button"
          className="relative p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800 transition"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
        </button>
      </div>
    </header>
  );
}
