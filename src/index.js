const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const { initPriceBoardSocket } = require("./socket/priceBoardSocket");
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

startServer();
