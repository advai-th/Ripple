import React from 'react';
import type { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const isError = t.type === 'error';
        const isSuccess = t.type === 'success';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-lg shadow-lg border flex items-center justify-between gap-3 text-xs font-medium animate-in slide-in-from-bottom-5 duration-200 ${
              isError
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : isSuccess
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-surface-container-lowest text-on-surface border-outline-variant'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                {isError ? 'error' : isSuccess ? 'check_circle' : 'info'}
              </span>
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="p-1 rounded hover:bg-black/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
