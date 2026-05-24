import React from 'react';

const ChartCard = ({ title, subtitle, children, darkMode, className = '' }) => (
  <div
    className={`rounded-2xl border p-4 sm:p-5 transition-colors duration-300 ${
      darkMode
        ? 'bg-slate-800/80 border-slate-700/60'
        : 'bg-white/90 border-slate-200/80 shadow-sm'
    } ${className}`}
  >
    <div className="mb-4">
      <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
      {subtitle && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      )}
    </div>
    <div className="relative w-full min-h-[200px] flex items-center justify-center">{children}</div>
  </div>
);

export default ChartCard;
