const { sql, connectDB } = require("../config/db");
const { generateToken } = require("../utils/jwt");

const login = async ({ username, password }) => {
  try {
    // Kết nối SQL Server với thông tin đăng nhập từ client
    const pool = await connectDB(username, password);

    // Lấy thông tin role
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username).query(`
                SELECT r.name AS role
                FROM sys.database_principals u
                JOIN sys.database_role_members rm ON u.principal_id = rm.member_principal_id
                JOIN sys.database_principals r ON rm.role_principal_id = r.principal_id
                WHERE u.name = @username
            `);

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
