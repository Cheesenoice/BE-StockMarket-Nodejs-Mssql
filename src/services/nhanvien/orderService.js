const { sql, connectDB } = require("../../config/db");

const trimRecordset = (recordset) =>
  recordset.map((row) => {
    Object.keys(row).forEach(
      (k) => typeof row[k] === "string" && (row[k] = row[k].trim())
    );
    return row;
  });

const getAllLenhDat = async (user) => {
  const pool = await connectDB(user.username, user.password);
  const result = await pool.request().query("SELECT * FROM LENHDAT");
  return trimRecordset(result.recordset);
};

const getAllLenhKhop = async (user) => {
  const pool = await connectDB(user.username, user.password);
  const result = await pool.request().query(`
    SELECT * FROM LENHKHOP WHERE MaGD IN (SELECT MaGD FROM LENHDAT)
  `);
  return trimRecordset(result.recordset);
};

const getAllLichSuTien = async (user) => {
  const pool = await connectDB(user.username, user.password);
  const result = await pool.request().query("SELECT * FROM LICHSU_TIEN");
  return trimRecordset(result.recordset);
};

const executeATO = async (user) => {
  const pool = await connectDB(user.username, user.password);
  const ngay = new Date().toISOString().split("T")[0]; // Lấy ngày hiện tại
  await pool
    .request()
    .input("Ngay", sql.Date, ngay)
    .input("LoaiLenh", sql.NChar, "ATO")
    .execute("sp_KhopLenhDinhKyFull");
  return { success: true, message: "Đã thực hiện khớp lệnh ATO thành công" };
};

const executeATC = async (user) => {
  const pool = await connectDB(user.username, user.password);
  const ngay = new Date().toISOString().split("T")[0]; // Lấy ngày hiện tại
  await pool
    .request()
    .input("Ngay", sql.Date, ngay)
    .input("LoaiLenh", sql.NChar, "ATC")
    .execute("sp_KhopLenhDinhKyFull");
  return { success: true, message: "Đã thực hiện khớp lệnh ATC thành công" };
};

module.exports = {
  getAllLenhDat,
  getAllLenhKhop,
  getAllLichSuTien,
  executeATO,
  executeATC,
};
