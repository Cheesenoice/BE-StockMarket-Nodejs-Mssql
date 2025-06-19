const { sql, connectDB } = require("../config/db");

const placeOrder = async ({ maCP, ngay, loaiGD, soLuong, gia, maTK }, user) => {
  try {
    console.log("User trong placeOrder:", user); // Debug user
    if (!user || !user.username || !user.password) {
      throw new Error("Thông tin xác thực user không hợp lệ.");
    }

    const pool = await connectDB(user.username, user.password);
    const result = await pool
      .request()
      .input("InputMaCP", sql.NChar, maCP)
      .input("InputNgay", sql.NVarChar, ngay)
      .input("InputLoaiGD", sql.Char, loaiGD)
      .input("InputSoLuong", sql.Int, soLuong)
      .input("InputGia", sql.Float, gia)
      .input("InputMaTK", sql.NChar, maTK)
      .execute("sp_KhopLenhLienTuc");
    return {
      success: true,
      message: "Đặt lệnh thành công",
      data: result.recordset,
    };
  } catch (err) {
    console.error("Lỗi khi đặt lệnh:", err);
    throw new Error(err.message);
  }
};

module.exports = { placeOrder };
