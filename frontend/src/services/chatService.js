import { chatApi } from '../config/api';

const chatService = {
  sendMessage: async ({ message, sessionId, userEmail, history }) => {
    const response = await chatApi.post('/chat', {
      message,
      session_id: sessionId || null,
      user_email: userEmail,
      history: history?.map((m) => ({ role: m.role, content: m.content })),
    });
    return response.data;
  },

  getSessions: async (userEmail) => {
    const response = await chatApi.get(
      `/chat/sessions/${encodeURIComponent(userEmail)}`
    );
    return response.data;
  },

  getSession: async (userEmail, sessionId) => {
    const response = await chatApi.get(
      `/chat/sessions/${encodeURIComponent(userEmail)}/${sessionId}`
    );
    return response.data;
  },

  deleteSession: async (userEmail, sessionId) => {
    await chatApi.delete(
      `/chat/sessions/${encodeURIComponent(userEmail)}/${sessionId}`
    );
  },
};

export default chatService;
