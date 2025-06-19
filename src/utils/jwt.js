const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (username) => {
  if (!username) {
    throw new Error("Thiếu username để tạo token.");
  }
  console.log("Tạo token với payload:", { username }); // Debug payload
  return jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token giải mã:", decoded); // Debug decoded token
    return decoded;
  } catch (err) {
    throw new Error("Token không hợp lệ hoặc đã hết hạn.");
  }
};

module.exports = { generateToken, verifyToken };
