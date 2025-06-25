const { sql, connectDB } = require("../../config/db");

const placeOrder = async (
  { maCP, ngay, loaiGD, soLuong, gia, maTK, loaiLenh, mkgd },
  user
) => {
  try {
    if (!user || !user.username || !user.password || !user.id) {
      throw new Error("Thông tin xác thực user không hợp lệ.");
    }

    const pool = await connectDB(user.username, user.password);
    const request = pool
      .request()
      .input("MaNDT", sql.NChar, user.id)
      .input("MaCP", sql.NChar, maCP)
      .input("Ngay", ngay === null || ngay === undefined ? null : ngay)
      .input("LoaiGD", sql.Char, loaiGD)
      .input("SoLuong", sql.Int, soLuong)
      .input("Gia", gia !== undefined && gia !== null ? gia : null)
      .input("MaTK", sql.NChar, maTK)
      .input("LoaiLenh", sql.NChar, loaiLenh)
      .input("MKGD", sql.NVarChar, mkgd);
    const result = await request.execute("sp_DatLenh");
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

const cancelOrder = async ({ maGD, mkgd }, user) => {
  try {
    if (!user || !user.username || !user.password || !user.id) {
      throw new Error("Thông tin xác thực user không hợp lệ.");
    }
    const pool = await connectDB(user.username, user.password);
    const result = await pool
      .request()
      .input("InputMaGD", sql.Int, maGD)
      .input("MaNDT", sql.NChar, user.id)
      .input("MKGD", sql.NVarChar, mkgd)
      .execute("sp_HuyLenh");
    return {
      success: true,
      message: "Hủy lệnh thành công",
      data: result.recordset,
    };
  } catch (err) {
    console.error("Lỗi khi hủy lệnh:", err);
    throw new Error(err.message);
  }
};

const getPendingOrders = async (user) => {
  if (!user || !user.username || !user.password || !user.id) {
    throw new Error("Thông tin xác thực user không hợp lệ.");
  }
  const pool = await connectDB(user.username, user.password);
  const result = await pool.request().input("MaNDT", sql.NChar, user.id)
    .query(`SELECT LD.[MaGD],
                   LD.[NgayGD],
                   LD.[LoaiGD],
                   LD.[LoaiLenh],
                   LD.[SoLuong],
                   LD.[MaCP],
                   LD.[Gia],
                   LD.[MaTK],
                   LD.[TrangThai]
            FROM [QL_GiaoDichCoPhieu].[dbo].[LENHDAT] AS LD
            JOIN [QL_GiaoDichCoPhieu].[dbo].[TAIKHOAN_NGANHANG] AS TK
              ON LD.MaTK = TK.MaTK
            WHERE TK.MaNDT = @MaNDT
              AND LD.TrangThai IN (N'Cho', N'MotPhan')
            ORDER BY LD.NgayGD DESC;`);
  // Trim all string fields in each record
  return result.recordset.map((row) => {
    Object.keys(row).forEach((k) => {
      if (typeof row[k] === "string") row[k] = row[k].trim();
    });
    return row;
  });
};

module.exports = {
  placeOrder,
  cancelOrder,
  getPendingOrders,
};
