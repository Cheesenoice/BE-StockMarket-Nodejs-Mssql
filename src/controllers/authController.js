const authService = require("../services/authService");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Thiếu tên đăng nhập hoặc mật khẩu.",
        });
    }
    const result = await authService.login({ username, password });
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

module.exports = { login };
