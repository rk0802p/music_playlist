<template>
    <div class="dashboard-container">
      <h1>Welcome to Your Dashboard</h1>
      <p>This is a protected area accessible only to authenticated users.</p>
      <button @click="logout" class="logout-btn">Logout</button>
  
      <div class="playlist-section">
        <h2>Your Playlists</h2>
        <div class="playlist-list">
          <div
            v-for="playlist in playlists"
            :key="playlist._id"
            @click="goToPlaylist(playlist._id)"
            class="playlist-card"
          >
            {{ playlist.name }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'Dashboard',
    data() {
      return {
        playlists: [],
      };
    },
    mounted() {
      this.fetchPlaylists();
    },
    methods: {
      async fetchPlaylists() {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/playlists`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.playlists = res.data;
        } catch (error) {
          console.error('Error fetching playlists:', error);
        }
      },
      logout() {
        localStorage.removeItem('token');
        this.$router.push('/login');
      },
      goToPlaylist(id) {
        this.$router.push(`/playlists/${id}`);
      },
    },
  };
  </script>
  
  <style scoped>
  .dashboard-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }
  
  .logout-btn {
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 0.5rem 1.2rem;
    margin: 1rem 0;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .logout-btn:hover {
    background-color: #dc2626;
  }
  
  .playlist-section {
    background-color: #f9f9f9;
    padding: 1.5rem;
    border-radius: 12px;
    margin-top: 2rem;
  }
  
  .playlist-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .playlist-card {
    padding: 1rem 1.5rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #ccc;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .playlist-card:hover {
    background-color: #e3f2fd;
    transform: translateY(-2px);
  }
  </style>
  