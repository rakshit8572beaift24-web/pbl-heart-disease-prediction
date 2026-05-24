import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

const ToastItem = ({ toast, onDismiss }) => (
  <div
    className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md min-w-[280px] max-w-sm animate-slide-in ${
      toast.type === 'success'
        ? 'bg-emerald-50/95 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-100'
        : 'bg-red-50/95 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-100'
    }`}
    role="alert"
  >
    {toast.type === 'success' ? (
      <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
    ) : (
      <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
    )}
    <p className="text-sm font-medium flex-1">{toast.message}</p>
    <button
      type="button"
      onClick={() => onDismiss(toast.id)}
      className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      aria-label="Dismiss"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success', duration = 4000) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
