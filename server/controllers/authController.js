const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const signup = async (req, res) => {
    const { username, email, password } = req.body; 
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "User already exists" });
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await User.create({ username, email, password: hashedPassword });
  
      const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
        expiresIn: "1h",
      });
  
      res
        .status(201)
        .json({ token, user: { id: newUser._id, username: newUser.username, email: newUser.email } });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  };
  
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser)
      return res.status(404).json({ message: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: existingUser._id, username: existingUser.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: {
        id: existingUser._id,
        email: existingUser.email,
        username: existingUser.username,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

module.exports = { signup, login };

console.log("JWT_SECRET in controller:", JWT_SECRET);
