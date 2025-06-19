const { getPriceBoard } = require("../services/priceBoardService");

const initPriceBoardSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Client đã kết nối:", socket.id);

    // Yêu cầu client gửi username/password khi kết nối
    socket.on("auth", ({ username, password }) => {
      if (!username || !password) {
        socket.emit("error", { message: "Thiếu username hoặc password." });
        return;
      }

      // Lưu username/password vào socket để tái sử dụng
      socket.username = username;
      socket.password = password;

      // Gửi bảng giá ban đầu
      getPriceBoard(io, socket.username, socket.password);
    });

    // Client yêu cầu cập nhật bảng giá
    socket.on("requestPriceBoard", () => {
      if (socket.username && socket.password) {
        getPriceBoard(io, socket.username, socket.password);
      } else {
        socket.emit("error", {
          message: "Chưa xác thực. Vui lòng gửi username/password.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client đã ngắt kết nối:", socket.id);
    });
  });

  // Giả lập cập nhật bảng giá định kỳ (có thể thay bằng Service Broker)
  setInterval(() => {
    // Lấy username/password của user đầu tiên để cập nhật (hoặc dùng tài khoản mặc định)
    const sockets = io.sockets.sockets;
    const firstSocket = sockets.values().next().value;
    if (firstSocket && firstSocket.username && firstSocket.password) {
      getPriceBoard(io, firstSocket.username, firstSocket.password);
    }
  }, 5000); // Cập nhật mỗi 5 giây
};

module.exports = { initPriceBoardSocket };
