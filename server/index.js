const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const playlistRoutes = require("./routes/playlist");


const app = express(); 

app.use(cors());
app.use(express.json());
app.use("/api/protected", protectedRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/playlists", playlistRoutes);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));

console.log("JWT_SECRET:", process.env.JWT_SECRET);
