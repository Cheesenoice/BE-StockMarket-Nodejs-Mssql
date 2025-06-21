const { sql, connectDB } = require("../config/db");
const { generateToken } = require("../utils/jwt");

const login = async ({ username, password }, session) => {
  try {
    // Kiểm tra xem user đã đăng nhập chưa (có session không)
    if (session && session.username === username) {
      // User đã đăng nhập, trả về thông báo đã đăng nhập
      return {
        success: true,
        message: "Bạn đã đăng nhập rồi.",
        alreadyLoggedIn: true,
        username: username,
      };
    }

    // Kết nối SQL Server với thông tin đăng nhập từ client
    const pool = await connectDB(username, password);

    // Lấy thông tin role bằng stored procedure
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .execute("sp_GetUserRole");

    const role = result.recordset[0]?.role || null;
    if (!role || !["NhanVien", "NhaDauTu"].includes(role)) {
      throw new Error("Không tìm thấy role hợp lệ.");
    }

    // Tạo JWT chỉ với username
    const token = generateToken(username);
    return { success: true, token, role };
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    throw new Error("Tên đăng nhập hoặc mật khẩu không đúng.");
  }
};

module.exports = { login };
