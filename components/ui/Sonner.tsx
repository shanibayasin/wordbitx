import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// Global lightweight event emitter for toasts
const listeners: Array<(toasts: ToastItem[]) => void> = [];
let toastsList: ToastItem[] = [];

function notify() {
  listeners.forEach((listener) => listener([...toastsList]));
}

export const toast = {
  success(message: string) {
    const id = Math.random().toString(36).substring(2, 9);
    toastsList = [...toastsList, { id, type: 'success', message }];
    notify();
    setTimeout(() => {
      toast.dismiss(id);
    }, 4000);
  },
  error(message: string) {
    const id = Math.random().toString(36).substring(2, 9);
    toastsList = [...toastsList, { id, type: 'error', message }];
    notify();
    setTimeout(() => {
      toast.dismiss(id);
    }, 5000);
  },
  info(message: string) {
    const id = Math.random().toString(36).substring(2, 9);
    toastsList = [...toastsList, { id, type: 'info', message }];
    notify();
    setTimeout(() => {
      toast.dismiss(id);
    }, 4000);
  },
  dismiss(id: string) {
    toastsList = toastsList.filter((t) => t.id !== id);
    notify();
  },
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.push(setItems);
    return () => {
      const idx = listeners.indexOf(setItems);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 animate-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center space-x-2.5">
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />}
            {t.type === 'info' && <Info className="h-5 w-5 text-sky-500 shrink-0" />}
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{t.message}</span>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
