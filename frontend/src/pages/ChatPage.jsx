import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useChatSession } from '../hooks/useChatSession';
import ChatSidebar from '../components/chat/ChatSidebar';
import Chatbot from '../components/chat/Chatbot';

const ChatPage = () => {
  const { user } = useAuth();
  const chat = useChatSession(user?.email);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <ChatSidebar
        sessions={chat.sessions}
        activeSessionId={chat.sessionId}
        onSelect={(id) => {
          chat.loadSession(id);
          setSidebarOpen(false);
        }}
        onNew={() => {
          chat.startNewChat();
          setSidebarOpen(false);
        }}
        onDelete={chat.deleteSession}
      />

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-16 bottom-0 z-50">
            <ChatSidebar
              sessions={chat.sessions}
              activeSessionId={chat.sessionId}
              onSelect={(id) => {
                chat.loadSession(id);
                setSidebarOpen(false);
              }}
              onNew={() => {
                chat.startNewChat();
                setSidebarOpen(false);
              }}
              onDelete={chat.deleteSession}
              onClose={() => setSidebarOpen(false)}
              mobile
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="md:hidden flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700"
        >
          <Menu className="w-4 h-4" />
          Conversations
        </button>
        <Chatbot
          messages={chat.messages}
          isTyping={chat.isTyping}
          error={chat.error}
          sendMessage={chat.sendMessage}
          startNewChat={chat.startNewChat}
        />
      </div>
    </div>
  );
};

export default ChatPage;
