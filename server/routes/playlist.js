const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const Playlist = require("../models/Playlist");

router.get("/", verifyToken, async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id });
    res.status(200).json(playlists);
  } catch (err) {
    res.status(500).json({ message: "Error fetching playlists", error: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, songs } = req.body;
    const newPlaylist = new Playlist({
      name,
      userId: req.user.id,
      songs: songs || [],
    });

    const savedPlaylist = await newPlaylist.save();
    res.status(201).json(savedPlaylist);
  } catch (err) {
    res.status(500).json({ message: "Error creating playlist", error: err.message });
  }
});

module.exports = router;

router.put("/:id", verifyToken, async (req, res) => {
    try {
      const playlist = await Playlist.findById(req.params.id);
  
      if (!playlist) return res.status(404).json({ message: "Playlist not found" });
      if (playlist.userId.toString() !== req.user.id)
        return res.status(403).json({ message: "Not authorized" });
  
      const updatedData = req.body;
      const updatedPlaylist = await Playlist.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );
  
      res.status(200).json(updatedPlaylist);
    } catch (err) {
      res.status(500).json({ message: "Error updating playlist", error: err.message });
    }
  });
  

router.delete("/:id", verifyToken, async (req, res) => {
    try {
      const playlist = await Playlist.findById(req.params.id);
  
      if (!playlist) return res.status(404).json({ message: "Playlist not found" });
      if (playlist.userId.toString() !== req.user.id)
        return res.status(403).json({ message: "Not authorized" });
  
      await Playlist.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Playlist deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting playlist", error: err.message });
    }
  });
  

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    if (playlist.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    res.status(200).json(playlist);
  } catch (err) {
    res.status(500).json({ message: "Error fetching playlist", error: err.message });
  }
});

router.post('/:id/songs', verifyToken, async (req, res) => {
  try {
    const { title, artist, url } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    playlist.songs.push({ title, artist, url });
    await playlist.save();

    res.status(200).json(playlist);
  } catch (err) {
    console.error('Error adding song:', err);
    res.status(500).json({ message: 'Server error while adding song', error: err.message });
  }
});
