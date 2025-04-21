const express = require("express");
const { signup, login } = require("../controllers/authController");
const auth = require("../middleware/auth"); 

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/protected", auth, (req, res) => {
  res.json({ message: `Welcome, user ${req.user.id}!` });
});

module.exports = router;
