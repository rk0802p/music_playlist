import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null,
  }),
  actions: {
    async login(email, password) {
        try {
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
            email, password
          });
          this.token = res.data.token;
          localStorage.setItem('token', this.token);
        } catch (error) {
          console.error('Login error:', error.response?.data || error.message);
          throw error;
        }
      },

    async signup(username, email, password) {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        username, email, password
      });
      this.token = res.data.token;
      localStorage.setItem('token', this.token);
    },

    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
    }
  },
});


console.log('API URL:', import.meta.env.VITE_API_URL);
