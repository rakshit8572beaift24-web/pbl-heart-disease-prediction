import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AuthLayout = ({ children, title, subtitle, wide = false }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/40 to-cyan-100 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950 transition-colors duration-500">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-3xl animate-float" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-5">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform duration-300">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
            MediAI Health
          </span>
        </Link>
        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur border border-white/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 shadow-sm"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      <main className="relative z-10 flex items-center justify-center px-4 pb-12">
        <div className={`w-full ${wide ? 'max-w-lg' : 'max-w-md'} animate-fade-in-up`}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-xl shadow-teal-500/30 mb-5 animate-pulse-slow">
              <Activity className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{title}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 dark:border-slate-700/50 p-8 transition-all duration-300">
            {children}
          </div>

          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} MediAI Healthcare Platform. Secure health assessments.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
