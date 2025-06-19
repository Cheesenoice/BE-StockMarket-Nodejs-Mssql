const express = require("express");
const session = require("express-session");
const app = express();
require("dotenv").config();

// Middleware
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

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
app.use("/api/orders", require("./routes/orderRoutes"));

module.exports = app;
