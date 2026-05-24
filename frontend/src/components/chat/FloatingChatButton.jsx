import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useChatSession } from '../../hooks/useChatSession';
import Chatbot from './Chatbot';

const FloatingChatButton = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const chat = useChatSession(user?.email);

  if (!isAuthenticated || location.pathname === '/chat') return null;

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[400px] h-[min(560px,calc(100vh-8rem))] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden animate-fade-in-up bg-white dark:bg-slate-900">
          <Chatbot
            compact
            onExpand={() => {
              setOpen(false);
              navigate('/chat');
            }}
            messages={chat.messages}
            isTyping={chat.isTyping}
            error={chat.error}
            sendMessage={chat.sendMessage}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-4 sm:right-6 z-[61] flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 ${
          open
            ? 'bg-slate-700 dark:bg-slate-600'
            : 'bg-gradient-to-br from-teal-500 to-cyan-600 hover:scale-110 shadow-teal-500/30'
        }`}
        aria-label={open ? 'Close chat' : 'Open health assistant'}
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>
    </>
  );
};

export default FloatingChatButton;
