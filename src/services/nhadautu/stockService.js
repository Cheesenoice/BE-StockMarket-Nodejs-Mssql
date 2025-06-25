const { sql, connectDB } = require("../../config/db");

const getAllStocks = async (user) => {
  const pool = await connectDB(user.username, user.password);
  const result = await pool.request().query(`
    SELECT MaCP, TenCty, DiaChi, SoLuongPH FROM QL_GiaoDichCoPhieu.dbo.COPHIEU;
  `);
  return result.recordset.map((row) => {
    Object.keys(row).forEach(
      (k) => typeof row[k] === "string" && (row[k] = row[k].trim())
    );
    return row;
  });
};

const getStockPrice = async (user, MaCP) => {
  const pool = await connectDB(user.username, user.password);
  try {
    const result = await pool
      .request()
      .input("InputMaCP", sql.NChar, MaCP)
      .execute("sp_XemGia");
    if (!result.recordset[0]) throw new Error("Không tìm thấy giá cổ phiếu");
    return result.recordset[0];
  } catch (err) {
    throw new Error(
      err.originalError &&
      err.originalError.info &&
      err.originalError.info.message
        ? err.originalError.info.message
        : err.message
    );
  }
};

module.exports = {
  getAllStocks,
  getStockPrice,
};
