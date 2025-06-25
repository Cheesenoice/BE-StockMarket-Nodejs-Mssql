const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (username, password, role, id = null) => {
  if (!username || !password || !role) {
    throw new Error("Thiếu username, password hoặc role để tạo token.");
  }
  // Không log password ra console ở production!
  const payload = { username, password, role };
  if (id) {
    payload.id = id; // Thêm MaNDT vào token với tên 'id'
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error("Token không hợp lệ hoặc đã hết hạn.");
  }
};

module.exports = { generateToken, verifyToken };
