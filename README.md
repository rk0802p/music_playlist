# Music Playlist App

A full-stack music playlist manager where users can sign up, log in, and manage their own playlists and songs.

- **Frontend:** Vue 3, Pinia, Vue Router, Axios ([View](https://music-playlist-pp8l.vercel.app/))
- **Backend:** Node.js, Express, MongoDB, JWT ([View](https://music-playlist-nine.vercel.app/))
- **Repo:** [github.com/rk0802p/music_playlist](https://github.com/rk0802p/music_playlist)

---

## 🚀 How to Use

### 1. Clone the repo
```bash
git clone https://github.com/rk0802p/music_playlist.git
cd music_playlist
```

### 2. Setup Backend
```bash
cd server
npm install
# Add .env with MONGO_URI and JWT_SECRET
npm run dev
```

### 3. Setup Frontend
```bash
cd ../music-playlist-frontend-vue
npm install
# Add .env with VITE_API_URL (your backend URL)
npm run dev
```

---

## 🛠️ What I Used / How I Built It
- **Frontend:** Vue 3, Pinia (state), Vue Router, Axios, Vite
- **Backend:** Express, MongoDB (Mongoose), JWT, bcryptjs, dotenv, cors
- **Deployment:** Vercel (serverless for both frontend & backend)

---

## 🌐 Live Demo
- Frontend: https://music-playlist-pp8l.vercel.app/
- Backend: https://music-playlist-nine.vercel.app/api/test

---

## 📁 Project Structure
```
music_playlist/
├── music-playlist-frontend-vue/   # Vue 3 frontend
└── server/                        # Node.js/Express backend
```

---