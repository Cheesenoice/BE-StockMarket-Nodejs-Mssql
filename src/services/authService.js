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

    // Gọi stored procedure sp_DangNhap
    const result = await pool
      .request()
      .input("TENLOGIN", sql.NVarChar, username)
      .execute("sp_DangNhap");

    const userInfo = result.recordset[0];
    const role = userInfo?.TENNHOM || null;
    const maNDT = userInfo?.MANDT || null;
    if (!role || !["nhanvien", "nhadautu"].includes(role)) {
      throw new Error("Không tìm thấy role hợp lệ.");
    }

    // Tạo JWT với username, password, role và MaNDT (id)
    const token = generateToken(username, password, role, maNDT);
    return { success: true, token, role, info: userInfo };
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    throw new Error("Tên đăng nhập hoặc mật khẩu không đúng.");
  }
};

module.exports = { login };
