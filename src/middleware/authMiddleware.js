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
    if (!decoded.username || !decoded.password || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Token không chứa username, password hoặc role.",
      });
    }

    // Kiểm tra role nếu có yêu cầu
    if (requiredRole && decoded.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập chức năng này.",
      });
    }

    req.user = {
      username: decoded.username,
      password: decoded.password,
      role: decoded.role,
      id: decoded.id,
    };
    // Nếu cần kiểm tra role, có thể lấy role từ DB hoặc token nếu đã lưu
    next();
  } catch (err) {
    console.error("Lỗi xác thực token:", err);
    return res
      .status(401)
      .json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

module.exports = authMiddleware;
