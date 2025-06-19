const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server chạy trên cổng ${PORT}`);
    });
  } catch (err) {
    console.error("Lỗi khởi động server:", err);
    process.exit(1);
  }
};

startServer();
