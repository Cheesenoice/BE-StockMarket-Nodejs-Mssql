const { verifyToken } = require("../utils/jwt");

const authMiddleware = (requiredRole) => (req, res, next) => {
  // Kiểm tra header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message:
        "Thiếu hoặc sai định dạng header Authorization. Cần định dạng: Bearer <token>",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Không có token." });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded.username) {
      return res.status(401).json({
        success: false,
        message: "Token không chứa username.",
      });
    }

    // Lấy username/password từ session
    const { username, password } = req.session;
    if (!username || !password || username !== decoded.username) {
      return res.status(401).json({
        success: false,
        message:
          "Session không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
      });
    }

    req.user = { username, password };
    // Nếu cần kiểm tra role, có thể lấy role từ DB hoặc session nếu đã lưu
    next();
  } catch (err) {
    console.error("Lỗi xác thực token:", err);
    return res
      .status(401)
      .json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

module.exports = authMiddleware;
