const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const playlistRoutes = require("./routes/playlist");

const app = express();


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://music-playlist-pp8l.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};


app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'API is working'
  });
});


app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/playlists", playlistRoutes);


app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});


app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});


module.exports = app;
