<template>
  <div class="playlist-wrapper">
    <div class="playlist-container">
      <div class="playlist-card">
        <div class="playlist-info">
          <img
            :src="getPlaylistThumbnail()"
            alt="Playlist Thumbnail"
            class="playlist-thumbnail"
            @error="onImageError"
          />
          <div class="playlist-text">
            <h2 class="playlist-name">{{ playlist?.name || 'Untitled Playlist' }}</h2>
            <span class="song-count">{{ playlist?.songs?.length || 0 }} songs</span>
          </div>
        </div>
        <div class="playlist-actions">
          <button @click="goBack" class="btn-action back-btn">
            <span class="btn-text">← Back</span>
          </button>
        </div>
      </div>

      <section class="add-song-section">
        <h3 class="section-title">Add New Song</h3>
        <div class="form-group">
          <input
            v-model="newSong.title"
            placeholder="Title"
            class="input-field"
          />
          <input
            v-model="newSong.artist"
            placeholder="Artist"
            class="input-field"
          />
          <input v-model="newSong.url" placeholder="URL" class="input-field" />
          <button @click="addSong" class="add-btn">Add Song</button>
        </div>
      </section>

      <section class="songs-section">
        <h3 class="section-title">Songs</h3>
        <div class="songs-controls">
          <input
            v-model="searchQuery"
            placeholder="Search by title or artist..."
            class="input-field search-input"
          />
          <button @click="toggleSortOrder" class="sort-btn">
            Sort: {{ sortOrder === "asc" ? "A → Z" : "Z → A" }}
          </button>
        </div>

        <div v-if="filteredSongs.length === 0" class="no-songs">
          No songs found.
        </div>

        <ul class="song-list">
          <li
            v-for="(song, index) in filteredSongs"
            :key="index"
            class="song-card"
          >
            <div v-if="editingIndex === index" class="edit-form-container">
              <div class="edit-form-group">
                <label>Title</label>
                <input
                  v-model="editSong.title"
                  class="input-field edit-input"
                />
                <label>Artist</label>
                <input
                  v-model="editSong.artist"
                  class="input-field edit-input"
                />
                <label>URL</label>
                <input v-model="editSong.url" class="input-field edit-input" />
              </div>
              <div class="edit-actions">
                <button @click="saveEdit(index)" class="btn-action btn-save">
                  Save
                </button>
                <button @click="cancelEdit" class="btn-action btn-cancel">
                  Cancel
                </button>
              </div>
            </div>
            <div v-else class="song-card-content">
              <div class="song-info">
                <img
                  :src="getSongThumbnail(song.url)"
                  alt="Song Thumbnail"
                  class="song-thumbnail"
                  @error="onImageError"
                />
                <div class="song-text">
                  <strong class="song-title">{{ parseSongTitle(song.title, song.artist) }}</strong>
                  <span class="song-artist" v-if="parseSongArtist(song.title, song.artist)">
                    ({{ parseSongArtist(song.title, song.artist) }})
                  </span>
                </div>
              </div>
              <div class="song-actions">
                <a :href="song.url" target="_blank" class="btn-action play-link"
                  >Play</a
                >
                <button
                  @click="startEdit(index, song)"
                  class="btn-action btn-edit"
                >
                  <span class="btn-text">Edit</span>
                </button>
                <button
                  @click="showDeleteConfirmation(index)"
                  class="btn-action btn-delete"
                >
                  <span class="btn-text">Delete</span>
                </button>
              </div>
              <div v-if="deleteIndex === index && showConfirmation" class="confirmation-prompt">
                <button @click="confirmDelete" class="confirm-btn confirm-yes">
                  <span class="confirm-icon">✔</span>
                </button>
                <button @click="cancelDelete" class="confirm-btn confirm-no">
                  <span class="confirm-icon">✖</span>
                </button>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";

const DEFAULT_THUMBNAIL = 'https://images.sftcdn.net/images/t_app-cover-m,f_auto/p/c0cab602-96bf-11e6-8561-00163ec9f5fa/1021633432/grand-theft-auto-vice-city-Playing-Grand-Theft-Auto-Vice-City-for-Windows.jpg';

const parseSongTitle = (title, artist) => {
  if (!title) return '';
  if (artist) {
    console.log("Using separate artist:", { title, artist });
    return title.trim();
  }
  const match = title.match(/^(.*?)(?:by(.*))?$/i);
  console.log("Parsing song string:", title, "Match:", match);
  return match && match[1] ? match[1].trim() : title;
};

const parseSongArtist = (title, artist) => {
  if (!title && !artist) return '';
  if (artist) {
    console.log("Using separate artist:", { title, artist });
    return artist.trim();
  }
  const match = title.match(/^(?:.*?by(.*))?$/i);
  console.log("Parsing song artist:", title, "Match:", match);
  return match && match[1] ? match[1].trim() : '';
};

const route = useRoute();
const router = useRouter();
const playlist = ref(null);
const searchQuery = ref("");
const sortOrder = ref("asc");
const deleteIndex = ref(null);
const showConfirmation = ref(false);

const newSong = ref({
  title: "",
  artist: "",
  url: "",
});

const editingIndex = ref(null);
const editSong = ref({ title: "", artist: "", url: "" });

const fetchPlaylist = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/playlists/${route.params.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    playlist.value = data;
    console.log("Fetched playlist data:", data);
  } catch (err) {
    console.error("Error fetching playlist:", err);
  }
};

const addSong = async () => {
  if (!newSong.value.title || !newSong.value.artist || !newSong.value.url)
    return;
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/playlists/${route.params.id}/songs`,
      newSong.value,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    newSong.value = { title: "", artist: "", url: "" };
    fetchPlaylist();
  } catch (err) {
    console.error("Failed to add song:", err);
  }
};

const showDeleteConfirmation = (index) => {
  console.log("Showing delete confirmation for index:", index);
  deleteIndex.value = index;
  showConfirmation.value = true;
  console.log("Confirmation state:", { deleteIndex: deleteIndex.value, showConfirmation: showConfirmation.value });
};

const confirmDelete = async () => {
  console.log("Confirming delete for index:", deleteIndex.value);
  if (deleteIndex.value === null) {
    console.warn("No index set for deletion");
    return;
  }

  try {
    const updatedSongs = playlist.value.songs.filter((_, i) => i !== deleteIndex.value);
    console.log("Sending PUT request with updated songs:", updatedSongs);
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/playlists/${route.params.id}`,
      { songs: updatedSongs },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log("Song deleted successfully");
    fetchPlaylist();
  } catch (err) {
    console.error("Error deleting song:", err.response ? err.response.data : err.message);
  } finally {
    cancelDelete();
  }
};

const cancelDelete = () => {
  console.log("Cancelling delete for index:", deleteIndex.value);
  deleteIndex.value = null;
  showConfirmation.value = false;
};

const startEdit = (index, song) => {
  editingIndex.value = index;
  editSong.value = { ...song };
};

const cancelEdit = () => {
  editingIndex.value = null;
  editSong.value = { title: "", artist: "", url: "" };
};

const saveEdit = async (index) => {
  const updatedSongs = [...playlist.value.songs];
  updatedSongs[index] = { ...editSong.value };

  try {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/playlists/${route.params.id}`,
      { songs: updatedSongs },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    editingIndex.value = null;
    fetchPlaylist();
  } catch (err) {
    console.error("Failed to update song:", err);
  }
};

const filteredSongs = computed(() => {
  if (!playlist.value?.songs) return [];

  const query = searchQuery.value.toLowerCase();

  const filtered = playlist.value.songs.filter(
    (song) =>
      song.title.toLowerCase().includes(query) ||
      (song.artist && song.artist.toLowerCase().includes(query))
  );

  return filtered.sort((a, b) => {
    const comparison = a.title.localeCompare(b.title);
    return sortOrder.value === "asc" ? comparison : -comparison;
  });
});

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
};

const goBack = () => {
  router.push("/");
};

const getPlaylistThumbnail = () => {
  if (!playlist.value?.songs || playlist.value.songs.length === 0) return DEFAULT_THUMBNAIL;
  const firstSong = playlist.value.songs[0];
  if (firstSong.url) {
    const youtubeMatch = firstSong.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (youtubeMatch && youtubeMatch[1]) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
    }
  }
  return DEFAULT_THUMBNAIL;
};

const getSongThumbnail = (url) => {
  if (url) {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (youtubeMatch && youtubeMatch[1]) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
    }
  }
  return DEFAULT_THUMBNAIL;
};

const onImageError = (event) => {
  event.target.src = DEFAULT_THUMBNAIL;
};

watch(showConfirmation, (newValue) => {
  console.log("Confirmation state changed to:", newValue);
});

onMounted(fetchPlaylist);
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap");

* {
  font-family: "Inter", sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.playlist-wrapper {
  min-height: 100vh;
  width: 100vw;
  background: #0a0a12;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(138, 43, 226, 0.15) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(170, 0, 255, 0.1) 0%, transparent 30%);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 0;
  color: #ffffff;
  animation: fadeIn 0.8s ease;
  overflow: visible !important;
}

.playlist-container {
  width: 100%;
  max-width: 900px;
  padding: 2rem;
  background: rgba(16, 16, 24, 0.6);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(138, 43, 226, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.playlist-container:hover {
  box-shadow: 0 0 25px rgba(138, 43, 226, 0.4);
  transform: translateY(-2px);
}

.playlist-card {
  background: rgba(18, 18, 24, 0.9);
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  padding: 2.5rem;
  min-height: 150px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.playlist-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 30px rgba(138, 43, 226, 0.5);
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

.playlist-actions {
  display: flex;
  gap: 1rem;
}

.back-btn {
  padding: 0.9rem 1.8rem;
  background: rgba(255, 51, 102, 0.2);
  color: #ff3366;
  border: 1px solid rgba(255, 51, 102, 0.5);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 51, 102, 0.5);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #ffffff;
  text-align: center;
}

.add-song-section,
.songs-section {
  margin-top: 2.5rem;
}

.form-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.input-field {
  padding: 0.9rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 1rem;
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

.search-input {
  width: 70%;
  margin-bottom: 1rem;
}

.add-btn {
  padding: 0.9rem 1.5rem;
  background: linear-gradient(45deg, #8a2be2, #4a00e0);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(138, 43, 226, 0.5);
}

.songs-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.sort-btn {
  padding: 0.7rem 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.sort-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(138, 43, 226, 0.4);
}

.song-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.song-card {
  background: rgba(18, 18, 24, 0.9);
  border-radius: 18px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s, box-shadow 0.3s;
  min-height: 150px;
}

.song-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(138, 43, 226, 0.5);
}

.song-card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.song-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
  background-color: #1a1a2e;
  border: 3px solid rgba(138, 43, 226, 0.4);
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.3);
  transition: transform 0.3s;
}

.song-thumbnail:hover {
  transform: scale(1.05);
}

.song-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.song-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  text-shadow: 0 0 5px rgba(138, 43, 226, 0.3);
}

.song-artist {
  font-size: 1.1rem;
  color: #aaaacc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.song-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-action {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
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

.play-link {
  background: rgba(0, 180, 219, 0.2);
  color: #00b4db;
  border: 1px solid rgba(0, 180, 219, 0.5);
  text-decoration: none;
}

.play-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 180, 219, 0.5);
}

.btn-edit {
  background: rgba(0, 180, 219, 0.2);
  color: #00b4db;
  border: 1px solid rgba(0, 180, 219, 0.5);
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 180, 219, 0.5);
}

.btn-delete {
  background: rgba(255, 51, 102, 0.2);
  color: #ff3366;
  border: 1px solid rgba(255, 51, 102, 0.5);
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 51, 102, 0.5);
}

.edit-form-container {
  width: 100%;
  background: rgba(24, 24, 32, 0.9);
  border-radius: 18px;
  padding: 1.5rem;
  border: 1px solid rgba(138, 43, 226, 0.2);
}

.edit-form-group {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}

.edit-form-group label {
  font-size: 0.9rem;
  color: #aaaacc;
  margin-bottom: 0.25rem;
}

.edit-input {
  padding: 0.9rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 1rem;
  color: #ffffff;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.edit-input:focus {
  outline: none;
  border-color: #8a2be2;
  box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.2);
}

.edit-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-save {
  background: rgba(0, 230, 118, 0.2);
  color: #00e676;
  border: 1px solid rgba(0, 230, 118, 0.5);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 230, 118, 0.5);
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.btn-cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 255, 255, 0.2);
}

.no-songs {
  text-align: center;
  padding: 2.5rem 0;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.confirmation-prompt {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(16, 16, 24, 0.8);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(138, 43, 226, 0.2);
  display: flex;
  gap: 2rem;
  z-index: 2000;
  backdrop-filter: blur(10px);
}

.confirm-btn {
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 50%;
  font-size: 2rem;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.confirm-icon {
  line-height: 1;
  display: block;
}

.confirm-yes {
  background: linear-gradient(45deg, #00e676, #00b300);
  color: #ffffff;
}

.confirm-yes:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 230, 118, 0.6);
}

.confirm-no {
  background: linear-gradient(45deg, #ff3366, #cc0000);
  color: #ffffff;
}

.confirm-no:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 51, 102, 0.6);
}

/* Animations */
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@media (min-width: 768px) {
  .playlist-card {
    min-height: 180px;
  }

  .playlist-thumbnail {
    width: 120px;
    height: 120px;
  }

  .song-thumbnail {
    width: 100px;
    height: 100px;
  }

  .song-card {
    min-height: 180px;
  }
}

@media (max-width: 767px) {
  .playlist-header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .form-group {
    grid-template-columns: 1fr;
  }

  .add-btn {
    width: 100%;
  }

  .songs-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .search-input {
    width: 100%;
  }

  .playlist-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .playlist-actions {
    width: 100%;
  }

  .back-btn {
    width: 100%;
  }

  .song-card {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }

  .song-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .song-thumbnail {
    width: 100%;
    height: auto;
    max-width: 150px;
  }

  .song-actions {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .edit-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .confirmation-prompt {
    position: relative;
    transform: none;
    top: 0;
    left: 0;
    margin-top: 1.5rem;
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    background: none;
    box-shadow: none;
    border: none;
    backdrop-filter: none;
  }

  .confirm-btn {
    width: 50px;
    height: 50px;
    font-size: 1.8rem;
  }
}
</style>