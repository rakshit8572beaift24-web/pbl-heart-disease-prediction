import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator = () => (
  <div className="flex gap-3 px-4 py-3 animate-fade-in-up">
    <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800">
      <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:300ms]" />
    </div>
  </div>
);

export default TypingIndicator;
