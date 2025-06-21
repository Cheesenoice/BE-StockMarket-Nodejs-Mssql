const sql = require("mssql");
require("dotenv").config();

// DB_USER, DB_PASS không còn dùng, lấy từ session khi login
// Thêm SESSION_SECRET vào .env, ví dụ:
// SESSION_SECRET=your_secret_here

// Lưu trữ các connection pool theo username
const connectionPools = new Map();

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
    // Kiểm tra xem đã có connection pool cho user này chưa
    if (connectionPools.has(username)) {
      const existingPool = connectionPools.get(username);
      // Kiểm tra xem pool còn hoạt động không
      if (existingPool.connected) {
        console.log(`Sử dụng connection pool hiện có cho user: ${username}`);
        return existingPool;
      } else {
        // Nếu pool không còn hoạt động, xóa khỏi cache
        connectionPools.delete(username);
      }
    }

    // Tạo connection pool mới
    const pool = new sql.ConnectionPool(dbConfig(username, password));
    await pool.connect();

    // Lưu pool vào cache
    connectionPools.set(username, pool);

    console.log(`Kết nối SQL Server thành công với user: ${username}`);
    return pool;
  } catch (err) {
    console.error("Lỗi kết nối SQL Server:", err);
    throw new Error("Không thể kết nối đến database.");
  }
};

// Hàm đóng connection pool cho một user cụ thể
const closeConnection = async (username) => {
  try {
    if (connectionPools.has(username)) {
      const pool = connectionPools.get(username);
      await pool.close();
      connectionPools.delete(username);
      console.log(`Đã đóng connection pool cho user: ${username}`);
    }
  } catch (err) {
    console.error(`Lỗi khi đóng connection pool cho user ${username}:`, err);
  }
};

// Hàm đóng tất cả connection pools
const closeAllConnections = async () => {
  try {
    for (const [username, pool] of connectionPools.entries()) {
      await pool.close();
      console.log(`Đã đóng connection pool cho user: ${username}`);
    }
    connectionPools.clear();
  } catch (err) {
    console.error("Lỗi khi đóng tất cả connection pools:", err);
  }
};

module.exports = { sql, connectDB, closeConnection, closeAllConnections };
