import React from 'react';
import { useShopStore } from '../../store/shopStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

export const ToastContainer = () => {
  const { toasts, removeToast } = useShopStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none max-w-sm w-full">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
          info: <Info className="h-5 w-5 text-indigo-500 shrink-0" />
        };

        const bgColors = {
          success: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200',
          error: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
          info: 'bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-200'
        };

        return (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto flex items-center justify-between p-4 rounded-2xl border shadow-lg animate-in slide-in-from-bottom-5 duration-300',
              bgColors[toast.type]
            )}
          >
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <p className="text-sm font-semibold">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
