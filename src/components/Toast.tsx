"use client";

import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const COLORS: Record<ToastType, { border: string; icon: string; bg: string }> = {
  success: { border: 'border-[#00D26A]/30', icon: 'text-[#00D26A]', bg: 'bg-[#00D26A]/10' },
  error:   { border: 'border-[#FF4560]/30', icon: 'text-[#FF4560]', bg: 'bg-[#FF4560]/10' },
  warning: { border: 'border-[#F5A623]/30', icon: 'text-[#F5A623]', bg: 'bg-[#F5A623]/10' },
  info:    { border: 'border-white/20',      icon: 'text-[#ccc]',    bg: 'bg-white/[0.05]' },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const Icon = ICONS[toast.type];
  const color = COLORS[toast.type];

  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), toast.duration ?? 5000);
    return () => clearTimeout(t);
  }, [toast, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 bg-[#131110] border ${color.border} rounded-xl px-4 py-3.5 shadow-2xl w-full max-w-[360px] animate-in slide-in-from-right-full duration-300`}
      role="alert"
    >
      <div className={`w-7 h-7 rounded-lg ${color.bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon size={15} className={color.icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-[13px] leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="text-[#7A7068] text-[11px] mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="cursor-pointer shrink-0 p-1 rounded-lg text-[#7A7068] hover:text-white hover:bg-white/[0.06] transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-4), { ...opts, id }]); // max 5 toasts
  }, []);

  const ctx: ToastContextType = {
    toast: add,
    success: (title, message) => add({ type: 'success', title, message }),
    error:   (title, message) => add({ type: 'error',   title, message }),
    warning: (title, message) => add({ type: 'warning', title, message }),
    info:    (title, message) => add({ type: 'info',    title, message }),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast stack */}
      <div className="fixed bottom-6 right-4 z-[300] flex flex-col gap-2.5 items-end sm:right-6">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={remove} />)}
      </div>
    </ToastContext.Provider>
  );
}
