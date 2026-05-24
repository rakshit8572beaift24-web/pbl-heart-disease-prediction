import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({
  label = 'Password',
  name = 'password',
  value,
  onChange,
  error,
  placeholder = '••••••••',
  hint,
  required = true,
  minLength,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-slate-400" />
        </div>
        <input
          id={name}
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${
            error
              ? 'border-red-400 dark:border-red-500'
              : 'border-slate-200 dark:border-slate-600'
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {hint && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      {error && <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default PasswordInput;
