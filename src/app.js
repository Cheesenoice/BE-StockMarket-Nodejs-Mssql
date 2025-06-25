const express = require("express");
const session = require("express-session");
const cors = require("cors");
const app = express();
require("dotenv").config();

// Middleware
app.use(cors()); // Cho phép CORS toàn bộ
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Parse text/plain as JSON
app.use((req, res, next) => {
  if (req.headers["content-type"] === "text/plain") {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        req.body = JSON.parse(data);
      } catch (e) {
        req.body = {};
      }
      next();
    });
  } else {
    next();
  }
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Body:", req.body);
  console.log("Headers:", req.headers);
  next();
});

// Thêm session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret", // nên đặt trong .env
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Nếu dùng HTTPS thì để true
  })
);

// Routes sẽ được thêm sau
// app.use('/api', require('./routes'));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/nhadautu", require("./routes/nhadautu/orderRoutes"));
const accountRoutes = require("./routes/nhadautu/accountRoutes");
app.use("/api/nhadautu", accountRoutes);
const userRoutes = require("./routes/nhanvien/userRoutes");
app.use("/api/nhanvien/users", userRoutes);
const stockRoutes = require("./routes/nhadautu/stockRoutes");
app.use("/api/nhadautu", stockRoutes);
const stockRoutesNhanVien = require("./routes/nhanvien/stockRoutes");
app.use("/api/nhanvien/stocks", stockRoutesNhanVien);
const backupRoutesNhanVien = require("./routes/nhanvien/backupRoutes");
app.use("/api/nhanvien/backup", backupRoutesNhanVien);
const nhanvienOrderRoutes = require("./routes/nhanvien/orderRoutes");
app.use("/api/nhanvien/orders", nhanvienOrderRoutes);

module.exports = app;
