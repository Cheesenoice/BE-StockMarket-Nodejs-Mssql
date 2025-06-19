const { sql, connectDB } = require("../config/db");

const getPriceBoard = async (io, username, password) => {
  try {
    const pool = await connectDB(username, password);
    const result = await pool.request().execute("sp_LayBangGiaTrucTuyen");
    io.emit("bangGiaUpdate", result.recordset);
  } catch (err) {
    console.error("Lỗi lấy bảng giá:", err);
  }
};

module.exports = { getPriceBoard };
