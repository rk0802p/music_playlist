import { defineStore } from 'pinia';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null,
  }),
  actions: {
    async login(email, password) {
      try {
        const res = await api.post('/api/auth/login', {
          email,
          password
        });
        
        if (res.data && res.data.token) {
          this.token = res.data.token;
          localStorage.setItem('token', this.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
          return res.data;
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
      }
    },

    async signup(username, email, password) {
      try {
        const res = await api.post('/api/auth/signup', {
          username,
          email,
          password
        });
        
        if (res.data && res.data.token) {
          this.token = res.data.token;
          localStorage.setItem('token', this.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
          return res.data;
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Signup error:', error.response?.data || error.message);
        throw error;
      }
    },

    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  },
});

console.log('API URL:', import.meta.env.VITE_API_URL);
