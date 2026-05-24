import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, message = 'Loading...', size = 'lg' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <Loader2 className={`${sizeClasses[size]} text-teal-500 animate-spin`} aria-hidden="true" />
      {message && (
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
