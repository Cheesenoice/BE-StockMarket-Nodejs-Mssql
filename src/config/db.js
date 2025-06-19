const sql = require("mssql");
require("dotenv").config();

// DB_USER, DB_PASS không còn dùng, lấy từ session khi login
// Thêm SESSION_SECRET vào .env, ví dụ:
// SESSION_SECRET=your_secret_here

const dbConfig = (username, password) => {
  if (!username || !password) {
    throw new Error("Thiếu tên đăng nhập hoặc mật khẩu để kết nối database.");
  }
  return {
    user: username,
    password: password,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
};

const connectDB = async (username, password) => {
  try {
    const pool = await sql.connect(dbConfig(username, password));
    console.log(`Kết nối SQL Server thành công với user: ${username}`);
    return pool;
  } catch (err) {
    console.error("Lỗi kết nối SQL Server:", err);
    throw new Error("Không thể kết nối đến database.");
  }
};

module.exports = { sql, connectDB };
