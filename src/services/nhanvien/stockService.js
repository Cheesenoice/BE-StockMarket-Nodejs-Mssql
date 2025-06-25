const { sql, connectDB } = require("../../config/db");

// Undo/Redo stacks (RAM only)
let undoStack = [];
let redoStack = [];

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

const addStock = async (user, { MaCP, TenCty, DiaChi, SoLuongPH }) => {
  const pool = await connectDB(user.username, user.password);
  await pool
    .request()
    .input("MaCP", sql.NChar, MaCP)
    .input("TenCty", sql.NVarChar, TenCty)
    .input("DiaChi", sql.NVarChar, DiaChi)
    .input("SoLuongPH", sql.Int, SoLuongPH)
    .query(
      `INSERT INTO COPHIEU (MaCP, TenCty, DiaChi, SoLuongPH) VALUES (@MaCP, @TenCty, @DiaChi, @SoLuongPH)`
    );
  // Push to undo stack
  undoStack.push({ action: "add", data: { MaCP, TenCty, DiaChi, SoLuongPH } });
  redoStack = [];
  return { success: true, message: "Thêm cổ phiếu thành công" };
};

const updateStock = async (user, MaCP, { TenCty, DiaChi, SoLuongPH }) => {
  const pool = await connectDB(user.username, user.password);
  // Lấy dữ liệu cũ để undo
  const old = await pool
    .request()
    .input("MaCP", sql.NChar, MaCP)
    .query(`SELECT * FROM COPHIEU WHERE MaCP = @MaCP`);
  if (!old.recordset[0]) throw new Error("Không tìm thấy cổ phiếu");
  await pool
    .request()
    .input("MaCP", sql.NChar, MaCP)
    .input("TenCty", sql.NVarChar, TenCty)
    .input("DiaChi", sql.NVarChar, DiaChi)
    .input("SoLuongPH", sql.Int, SoLuongPH)
    .query(
      `UPDATE COPHIEU SET TenCty = @TenCty, DiaChi = @DiaChi, SoLuongPH = @SoLuongPH WHERE MaCP = @MaCP`
    );
  undoStack.push({
    action: "update",
    before: old.recordset[0],
    after: { MaCP, TenCty, DiaChi, SoLuongPH },
  });
  redoStack = [];
  return { success: true, message: "Cập nhật cổ phiếu thành công" };
};

const deleteStock = async (user, MaCP) => {
  const pool = await connectDB(user.username, user.password);
  // Lấy dữ liệu cũ để undo
  const old = await pool
    .request()
    .input("MaCP", sql.NChar, MaCP)
    .query(`SELECT * FROM COPHIEU WHERE MaCP = @MaCP`);
  if (!old.recordset[0]) throw new Error("Không tìm thấy cổ phiếu");
  try {
    await pool
      .request()
      .input("MaCP", sql.NChar, MaCP)
      .execute("sp_XoaCoPhieu");
  } catch (err) {
    // Nếu là lỗi từ RAISERROR trong SP thì trả về message cho client
    throw new Error(
      err.originalError &&
      err.originalError.info &&
      err.originalError.info.message
        ? err.originalError.info.message
        : err.message
    );
  }
  undoStack.push({ action: "delete", data: old.recordset[0] });
  redoStack = [];
  return { success: true, message: "Xóa cổ phiếu thành công" };
};

const undo = async (user) => {
  if (undoStack.length === 0) throw new Error("Không có thao tác để undo");
  const last = undoStack.pop();
  const pool = await connectDB(user.username, user.password);
  let result;
  if (last.action === "add") {
    // Undo thêm: xóa cổ phiếu vừa thêm
    await pool
      .request()
      .input("MaCP", sql.NChar, last.data.MaCP)
      .query(`DELETE FROM COPHIEU WHERE MaCP = @MaCP`);
    result = { success: true, message: "Đã undo thêm cổ phiếu" };
  } else if (last.action === "update") {
    // Undo sửa: trả lại dữ liệu cũ
    const { MaCP, TenCty, DiaChi, SoLuongPH } = last.before;
    await pool
      .request()
      .input("MaCP", sql.NChar, MaCP)
      .input("TenCty", sql.NVarChar, TenCty)
      .input("DiaChi", sql.NVarChar, DiaChi)
      .input("SoLuongPH", sql.Int, SoLuongPH)
      .query(
        `UPDATE COPHIEU SET TenCty = @TenCty, DiaChi = @DiaChi, SoLuongPH = @SoLuongPH WHERE MaCP = @MaCP`
      );
    result = { success: true, message: "Đã undo cập nhật cổ phiếu" };
  } else if (last.action === "delete") {
    // Undo xóa: thêm lại cổ phiếu
    const { MaCP, TenCty, DiaChi, SoLuongPH } = last.data;
    await pool
      .request()
      .input("MaCP", sql.NChar, MaCP)
      .input("TenCty", sql.NVarChar, TenCty)
      .input("DiaChi", sql.NVarChar, DiaChi)
      .input("SoLuongPH", sql.Int, SoLuongPH)
      .query(
        `INSERT INTO COPHIEU (MaCP, TenCty, DiaChi, SoLuongPH) VALUES (@MaCP, @TenCty, @DiaChi, @SoLuongPH)`
      );
    result = { success: true, message: "Đã undo xóa cổ phiếu" };
  }
  redoStack.push(last);
  return result;
};

const redo = async (user) => {
  if (redoStack.length === 0) throw new Error("Không có thao tác để redo");
  const last = redoStack.pop();
  const pool = await connectDB(user.username, user.password);
  let result;
  if (last.action === "add") {
    // Redo thêm: thêm lại cổ phiếu
    const { MaCP, TenCty, DiaChi, SoLuongPH } = last.data;
    await pool
      .request()
      .input("MaCP", sql.NChar, MaCP)
      .input("TenCty", sql.NVarChar, TenCty)
      .input("DiaChi", sql.NVarChar, DiaChi)
      .input("SoLuongPH", sql.Int, SoLuongPH)
      .query(
        `INSERT INTO COPHIEU (MaCP, TenCty, DiaChi, SoLuongPH) VALUES (@MaCP, @TenCty, @DiaChi, @SoLuongPH)`
      );
    result = { success: true, message: "Đã redo thêm cổ phiếu" };
  } else if (last.action === "update") {
    // Redo sửa: cập nhật lại dữ liệu mới
    const { MaCP, TenCty, DiaChi, SoLuongPH } = last.after;
    await pool
      .request()
      .input("MaCP", sql.NChar, MaCP)
      .input("TenCty", sql.NVarChar, TenCty)
      .input("DiaChi", sql.NVarChar, DiaChi)
      .input("SoLuongPH", sql.Int, SoLuongPH)
      .query(
        `UPDATE COPHIEU SET TenCty = @TenCty, DiaChi = @DiaChi, SoLuongPH = @SoLuongPH WHERE MaCP = @MaCP`
      );
    result = { success: true, message: "Đã redo cập nhật cổ phiếu" };
  } else if (last.action === "delete") {
    // Redo xóa: xóa lại cổ phiếu
    await pool
      .request()
      .input("MaCP", sql.NChar, last.data.MaCP)
      .query(`DELETE FROM COPHIEU WHERE MaCP = @MaCP`);
    result = { success: true, message: "Đã redo xóa cổ phiếu" };
  }
  undoStack.push(last);
  return result;
};

module.exports = {
  getAllStocks,
  addStock,
  updateStock,
  deleteStock,
  undo,
  redo,
};
