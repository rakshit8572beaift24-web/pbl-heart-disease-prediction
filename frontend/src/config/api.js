import axios from 'axios';

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/** Longer timeout for AI chat / slow ML endpoints */
export const chatApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
});

const formatError = (error) => {
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. The server may be busy — please try again.';
  }
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    return typeof detail === 'string' ? detail : JSON.stringify(detail);
  }
  return error.message || 'Something went wrong. Please try again.';
};

const attachInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) =>
      Promise.reject({
        status: error.response?.status,
        detail: formatError(error),
      })
  );
};

attachInterceptor(api);
attachInterceptor(chatApi);

export default api;
