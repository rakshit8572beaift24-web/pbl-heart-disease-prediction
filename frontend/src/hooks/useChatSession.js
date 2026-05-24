import { useState, useCallback, useEffect } from 'react';
import chatService from '../services/chatService';

const localKey = (email) => `chat_active_session_${email}`;

export const useChatSession = (userEmail) => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const loadSessions = useCallback(async () => {
    if (!userEmail) return;
    try {
      const data = await chatService.getSessions(userEmail);
      setSessions(data);
    } catch {
      setSessions([]);
    }
  }, [userEmail]);

  const loadSession = useCallback(
    async (id) => {
      if (!userEmail || !id) return;
      try {
        const data = await chatService.getSession(userEmail, id);
        setSessionId(data.id);
        setMessages(data.messages || []);
        localStorage.setItem(localKey(userEmail), id);
      } catch {
        setError('Failed to load conversation');
      }
    },
    [userEmail]
  );

  const startNewChat = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setError(null);
    if (userEmail) localStorage.removeItem(localKey(userEmail));
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    loadSessions();
    const saved = localStorage.getItem(localKey(userEmail));
    if (saved) loadSession(saved);
  }, [userEmail, loadSessions, loadSession]);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || !userEmail || isTyping) return;

      const userMsg = {
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setIsTyping(true);
      setError(null);

      try {
        const history = messages.map((m) => ({ role: m.role, content: m.content }));
        const data = await chatService.sendMessage({
          message: text.trim(),
          sessionId,
          userEmail,
          history,
        });

        setSessionId(data.session_id);
        setMessages(data.messages);
        localStorage.setItem(localKey(userEmail), data.session_id);
        await loadSessions();
      } catch (err) {
        setError(err.detail || 'Failed to send message');
        setMessages(messages);
      } finally {
        setIsTyping(false);
      }
    },
    [userEmail, sessionId, messages, isTyping, loadSessions]
  );

  const deleteSession = useCallback(
    async (id) => {
      if (!userEmail) return;
      await chatService.deleteSession(userEmail, id);
      if (sessionId === id) startNewChat();
      await loadSessions();
    },
    [userEmail, sessionId, startNewChat, loadSessions]
  );

  return {
    messages,
    sessionId,
    sessions,
    isTyping,
    error,
    sendMessage,
    startNewChat,
    loadSession,
    deleteSession,
    loadSessions,
  };
};
