const authService = require("../services/authService");
const { closeConnection } = require("../config/db");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tên đăng nhập hoặc mật khẩu.",
      });
    }

    // Truyền session vào service để kiểm tra
    const result = await authService.login({ username, password }, req.session);

    // Nếu đã đăng nhập rồi, không cần lưu session mới
    if (!result.alreadyLoggedIn) {
      // Lưu username và password vào session
      req.session.username = username;
      req.session.password = password;
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const username = req.session.username;

    if (username) {
      // Đóng connection pool cho user này
      await closeConnection(username);

      // Xóa session
      req.session.destroy((err) => {
        if (err) {
          console.error("Lỗi khi xóa session:", err);
          return res.status(500).json({
            success: false,
            message: "Lỗi khi đăng xuất.",
          });
        }

        res.status(200).json({
          success: true,
          message: "Đăng xuất thành công.",
        });
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Bạn chưa đăng nhập.",
      });
    }
  } catch (err) {
    console.error("Lỗi đăng xuất:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đăng xuất.",
    });
  }
};

module.exports = { login, logout };
