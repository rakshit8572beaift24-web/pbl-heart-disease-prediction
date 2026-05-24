import React from 'react';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  icon: Icon,
  placeholder,
  required = false,
  ...rest
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${
          error
            ? 'border-red-400 dark:border-red-500'
            : 'border-slate-200 dark:border-slate-600'
        }`}
        {...rest}
      />
    </div>
    {error && <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>}
  </div>
);

export default FormInput;
