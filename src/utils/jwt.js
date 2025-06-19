const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (user) => {
  if (!user.username || !user.password || !user.role) {
    throw new Error("Thiếu thông tin user để tạo token.");
  }
  console.log("Tạo token với payload:", user); // Debug payload
  return jwt.sign(user, process.env.JWT_SECRET, {
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
