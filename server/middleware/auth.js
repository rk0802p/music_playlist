const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;


const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Incoming token:", token);
  console.log("JWT_SECRET in middleware:", process.env.JWT_SECRET);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT verify failed:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;

