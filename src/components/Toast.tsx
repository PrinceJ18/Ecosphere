import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface ToastType {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastProps {
  toasts: ToastType[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { key?: string; toast: ToastType; onClose: (id: string) => void }) {
  const { id, message, type } = toast;

  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.2)',
      text: 'text-emerald-500',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      bg: 'rgba(244, 63, 94, 0.1)',
      border: 'rgba(244, 63, 94, 0.2)',
      text: 'text-rose-500',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.2)',
      text: 'text-amber-500',
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-500" />,
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.2)',
      text: 'text-blue-500',
    },
  }[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg"
      style={{
        background: 'var(--bg-glass)',
        borderColor: config.border,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {message}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-0.5 rounded-lg hover:bg-white/10 transition-colors"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
