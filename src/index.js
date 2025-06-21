const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const { initPriceBoardSocket } = require("./socket/priceBoardSocket");
const { closeAllConnections } = require("./config/db");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Thay bằng URL frontend thực tế
    methods: ["GET", "POST"],
  },
});

// Khởi tạo socket cho bảng giá
initPriceBoardSocket(io);

app.set("io", io);

const startServer = async () => {
  try {
    server.listen(PORT, () => {
      console.log(`Server chạy trên cổng ${PORT}`);
    });
  } catch (err) {
    console.error("Lỗi khởi động server:", err);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\nNhận tín hiệu ${signal}. Đang đóng server...`);

  try {
    // Đóng tất cả connection pools
    await closeAllConnections();

    // Đóng server
    server.close(() => {
      console.log("Server đã đóng thành công.");
      process.exit(0);
    });

    // Force close sau 10 giây nếu không đóng được
    setTimeout(() => {
      console.error("Force close server sau 10 giây.");
      process.exit(1);
    }, 10000);
  } catch (err) {
    console.error("Lỗi khi đóng server:", err);
    process.exit(1);
  }
};

// Lắng nghe các tín hiệu để graceful shutdown
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();
