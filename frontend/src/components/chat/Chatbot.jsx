import React, { useRef, useEffect } from 'react';
import { Bot, Sparkles, AlertCircle } from 'lucide-react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';

const SUGGESTIONS = [
  'What are heart disease risk factors?',
  'How can I lower my cholesterol?',
  'What is a healthy resting heart rate?',
  'When should I see a doctor about chest pain?',
];

const Chatbot = ({
  compact = false,
  onExpand,
  messages = [],
  isTyping = false,
  error = null,
  sendMessage,
  startNewChat,
}) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div
      className={`flex flex-col bg-white dark:bg-slate-900 ${
        compact ? 'h-full' : 'h-full'
      }`}
    >
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
              MediAI Assistant
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Healthcare guidance • Not medical advice
            </p>
          </div>
        </div>
        {compact && onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
          >
            Open full chat
          </button>
        )}
        {!compact && startNewChat && (
          <button
            type="button"
            onClick={startNewChat}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            New chat
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20 mb-4">
              <Bot className="w-12 h-12 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
              How can I help with your health today?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
              Ask about heart health, lifestyle, wellness, or understanding medical terms.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage?.(s)}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-600 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={`${msg.timestamp || i}-${i}`} message={msg} />
        ))}

        {isTyping && <TypingIndicator />}

        {error && (
          <div className="mx-4 my-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      <p className="shrink-0 px-4 py-1.5 text-[10px] text-center text-slate-400 dark:text-slate-500">
        AI responses are for education only. Consult a doctor for medical advice.
      </p>

      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </div>
  );
};

export default Chatbot;
