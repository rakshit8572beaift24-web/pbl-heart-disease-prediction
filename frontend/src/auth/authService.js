import api from '../config/api';

const USER_KEY = 'user';
const REMEMBER_EMAIL_KEY = 'rememberedEmail';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  signup: async (userData) => {
    const payload = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      dateOfBirth: userData.dateOfBirth,
      createdAt: new Date().toISOString(),
    };
    const response = await api.post('/signup', payload);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.post('/update-profile', profileData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem(USER_KEY),

  saveUser: (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  },

  getRememberedEmail: () => localStorage.getItem(REMEMBER_EMAIL_KEY) || '',

  setRememberedEmail: (email) => {
    if (email) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }
  },
};

export default authService;
