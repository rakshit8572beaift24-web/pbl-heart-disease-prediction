import React from 'react';
import { Bot, User } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 px-4 py-3 animate-fade-in-up ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      <div
        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          isUser
            ? 'bg-slate-200 dark:bg-slate-700'
            : 'bg-gradient-to-br from-teal-500 to-cyan-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-tr-sm'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-200/50 dark:border-slate-700/50'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};

export default ChatMessage;
