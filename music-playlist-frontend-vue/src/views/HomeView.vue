<template>
  <div class="home-container">
    <header class="header-section">
      <div class="user-welcome">
        <h1>Welcome, {{ username }}</h1>
        <span class="wave-emoji">👋</span>
      </div>
      <button class="btn-logout" @click="logout">Logout</button>
    </header>

    <section class="hero-section">
      <h2 class="hero-title">Your Playlists, Your Vibe.</h2>
      <p class="hero-subtitle">Create, manage, and vibe to your own music library.</p>
    </section>

    <div class="content-grid">
      <div class="centered-content">
        <section class="create-section">
          <h3 class="section-title">Create New Playlist</h3>
          <div class="input-group">
            <input
              v-model="newPlaylistName"
              placeholder="Playlist Name"
              class="input-field"
              @keyup.enter="createPlaylist"
            />
            <button class="btn-create" @click="createPlaylist">
              Create
            </button>
          </div>
        </section>

        <section class="library-section">
          <h3 class="section-title">Your Library</h3>
          <div v-if="playlists.length === 0" class="no-playlists">
            No playlists yet. Create one to get started!
          </div>
          <ul class="playlist-list" v-else>
            <li
              v-for="playlist in playlists"
              :key="playlist._id"
              class="playlist-item"
            >
              <div v-if="editingPlaylistId === playlist._id" class="rename-container">
                <input
                  v-model="editName"
                  class="input-field rename-input"
                  ref="renameInput"
                  @keyup.enter="saveRename(playlist._id)"
                  @keyup.esc="cancelRename"
                />
                <div class="action-buttons">
                  <button class="btn-action btn-save" @click="saveRename(playlist._id)">Save</button>
                  <button class="btn-action btn-cancel" @click="cancelRename">Cancel</button>
                </div>
              </div>
              <div v-else class="playlist-content">
                <div class="playlist-info">
                  <img
                    :src="getThumbnailUrl(playlist)"
                    alt="Playlist Thumbnail"
                    class="playlist-thumbnail"
                    @error="onImageError"
                  />
                  <div class="playlist-text">
                    <h4 class="playlist-name">{{ playlist.name }}</h4>
                    <span class="song-count">{{ playlist.songs?.length || 0 }} songs</span>
                  </div>
                </div>
                <div class="action-buttons">
                  <button class="btn-action btn-rename" @click="startRename(playlist)">
                    <span class="btn-text">Rename</span>
                  </button>
                  <button class="btn-action btn-view" @click="goToPlaylist(playlist._id)">
                    <span class="btn-text">View/Add</span>
                  </button>
                  <button class="btn-action btn-delete" @click="deletePlaylist(playlist._id)">
                    <span class="btn-text">Delete</span>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/playlists`;
const authStore = useAuthStore();
const router = useRouter();
const username = ref('user');
const playlists = ref([]);
const newPlaylistName = ref('');
const editingPlaylistId = ref(null);
const editName = ref('');
const renameInput = ref(null);

const DEFAULT_THUMBNAIL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMwDMjnBO6isohyLBLTfq2Ui2FGpN21P2TCw&s';

const token = localStorage.getItem('token');
if (token) {
  try {
    const decoded = jwtDecode(token);
    username.value = decoded.username || 'user';
  } catch (err) {
    console.error('Token decode failed:', err);
    logout();
  }
}

const logout = () => {
  authStore.logout();
  router.push('/login');
};

const getAuthHeaders = () => {
  const currentToken = localStorage.getItem('token');
  if (!currentToken) {
    console.error('No token found for request.');
    logout();
    return null;
  }
  return { Authorization: `Bearer ${currentToken}` };
};

const fetchPlaylists = async () => {
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    const { data } = await axios.get(API_BASE, { headers });
    playlists.value = data.map((p) => ({ ...p, songs: p.songs || [] }));
    console.log('Fetched playlists with songs:', playlists.value);
  } catch (err) {
    console.error('Failed to fetch playlists:', err);
    if (err.response && err.response.status === 401) {
      logout();
    }
  }
};

const createPlaylist = async () => {
  if (!newPlaylistName.value.trim()) return;
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    await axios.post(
      API_BASE,
      { name: newPlaylistName.value.trim() },
      { headers }
    );
    newPlaylistName.value = '';
    fetchPlaylists();
  } catch (err) {
    console.error('Create failed:', err);
    if (err.response && err.response.status === 401) logout();
    alert('Could not create playlist');
  }
};

const startRename = async (playlist) => {
  editingPlaylistId.value = playlist._id;
  editName.value = playlist.name;
  await nextTick();
  renameInput.value?.focus();
};

const cancelRename = () => {
  editingPlaylistId.value = null;
  editName.value = '';
};

const saveRename = async (id) => {
  const trimmedName = editName.value.trim();
  if (!trimmedName) return;
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    await axios.put(`${API_BASE}/${id}`, { name: trimmedName }, { headers });
    editingPlaylistId.value = null;
    editName.value = '';
    fetchPlaylists();
  } catch (err) {
    console.error('Rename failed:', err);
    if (err.response && err.response.status === 401) logout();
    alert('Could not rename playlist');
  }
};

const deletePlaylist = async (id) => {
  if (confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      await axios.delete(`${API_BASE}/${id}`, { headers });
      fetchPlaylists();
    } catch (err) {
      console.error('Delete failed:', err);
      if (err.response && err.response.status === 401) logout();
      alert('Could not delete playlist');
    }
  }
};

const goToPlaylist = (playlistId) => {
  router.push(`/playlists/${playlistId}`);
};

const getThumbnailUrl = (playlist) => {
  if (!playlist.songs || playlist.songs.length === 0) return DEFAULT_THUMBNAIL;

  const firstSong = playlist.songs[0];
  if (firstSong.url) {
    const youtubeMatch = firstSong.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (youtubeMatch && youtubeMatch[1]) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
    }
  }
  return DEFAULT_THUMBNAIL;
};

const onImageError = (event) => {
  event.target.src = DEFAULT_THUMBNAIL;
};

onMounted(fetchPlaylists);
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap");

* {
  font-family: "Inter", sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.home-container {
  min-height: 100vh;
  width: 100vw;
  background: #0a0a12;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(138, 43, 226, 0.15) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(170, 0, 255, 0.1) 0%, transparent 30%);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 2rem 0;
  color: #ffffff;
  animation: fadeIn 0.8s ease;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 4rem;
  padding: 0 2rem;
}

.user-welcome {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-welcome h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(45deg, #ffffff, #aaaacc);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin: 0;
}

.wave-emoji {
  font-size: 1.8rem;
  animation: fadeIn 2s infinite ease-in-out;
  transform-origin: 70% 70%;
  display: inline-block;
}

.hero-section {
  text-align: center;
  margin-bottom: 4rem;
  padding: 0 2rem;
  width: 100%;
  max-width: 1200px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #8a2be2, #ff00ff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #aaaacc;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.5;
}

.content-grid {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0 2rem;
  max-width: 1200px;
}

.centered-content {
  width: 100%;
  max-width: 800px; 
  display: flex;
  flex-direction: column;
  gap: 3rem; 
}

.create-section, .library-section {
  width: 100%;
  padding: 3rem;
  background: rgba(16, 16, 24, 0.6);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(138, 43, 226, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.create-section:hover, .library-section:hover {
  box-shadow: 0 0 25px rgba(138, 43, 226, 0.4);
  transform: translateY(-3px);
}

.library-section {
  min-height: 500px;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 2.5rem;
  color: #ffffff;
  text-align: center;
}

.input-group {
  display: flex;
  gap: 2rem;
}

.input-field {
  flex: 1;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 1.1rem;
  color: #ffffff;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-field:focus {
  outline: none;
  border-color: #8a2be2;
  box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.2);
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.btn-logout {
  padding: 0.7rem 1.8rem;
  background: rgba(255, 51, 102, 0.8);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-logout:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 18px rgba(255, 51, 102, 0.5);
}

.btn-create {
  padding: 1rem;
  background: linear-gradient(45deg, #8a2be2, #4a00e0);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 18px rgba(138, 43, 226, 0.5);
}

.playlist-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2.5rem; 
}

.playlist-item {
  background: rgba(18, 18, 24, 0.9);
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  padding: 2.5rem;
  min-height: 220px; 
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.playlist-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 30px rgba(138, 43, 226, 0.5);
}

.playlist-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.playlist-info {
  display: flex;
  align-items: center;
  gap: 2rem; 
}

.playlist-thumbnail {
  width: 100px; 
  height: 100px; 
  object-fit: cover;
  border-radius: 10px; 
  background-color: #1a1a2e;
  border: 3px solid rgba(138, 43, 226, 0.4); 
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.3); 
  transition: transform 0.3s;
}

.playlist-thumbnail:hover {
  transform: scale(1.05); 
}

.playlist-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.playlist-name {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  overflow-wrap: break-word;
  max-width: 100%;
  color: #ffffff;
  text-shadow: 0 0 5px rgba(138, 43, 226, 0.3); 
}

.song-count {
  font-size: 1.1rem; 
  color: rgba(255, 255, 255, 0.8); 
}

.action-buttons {
  display: flex;
  gap: 1.2rem; 
  flex-wrap: wrap;
  justify-content: flex-end; 
}

.btn-action {
  border: none;
  border-radius: 14px; 
  padding: 0.9rem 1.8rem; 
  font-size: 1.1rem; 
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1); 
  color: #ffffff;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(138, 43, 226, 0.4);
}

.btn-rename {
  background: rgba(0, 230, 118, 0.2);
  color: #00e676;
  border: 1px solid rgba(0, 230, 118, 0.5);
}

.btn-view {
  background: rgba(0, 180, 219, 0.2);
  color: #00b4db;
  border: 1px solid rgba(0, 180, 219, 0.5);
}

.btn-delete {
  background: rgba(255, 51, 102, 0.2);
  color: #ff3366;
  border: 1px solid rgba(255, 51, 102, 0.5);
}

.btn-save {
  background: rgba(0, 230, 118, 0.2);
  color: #00e676;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.rename-container {
  padding: 2rem;
  display: flex;
  gap: 2rem;
  align-items: center;
}

.rename-input {
  flex: 1;
  margin: 0;
}

.no-playlists {
  text-align: center;
  padding: 3rem 0;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

/* Animations */
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@media (min-width: 768px) {
  .centered-content {
    max-width: 900px; 
  }

  .library-section {
    min-height: 600px; 
  }

  .playlist-thumbnail {
    width: 120px; 
    height: 120px; 
  }

  .playlist-item {
    min-height: 280px; 
  }
}

@media (max-width: 767px) {
  .content-grid {
    padding: 0 1rem;
  }

  .centered-content {
    max-width: 100%; 
  }

  .create-section, .library-section {
    padding: 2rem;
  }

  .library-section {
    min-height: 450px; 
  }

  .playlist-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  
  .input-group {
    flex-direction: column;
    gap: 1.5rem;
  }

  .playlist-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .playlist-thumbnail {
    width: 100%;
    height: auto;
    max-width: 180px;
  }

  .playlist-item {
    min-height: 250px; 
    padding: 1.5rem;
  }

  .action-buttons {
    justify-content: center; 
  }
}

@media (min-width: 1200px) {
  .content-grid {
    padding: 0 4rem;
  }
}
</style>