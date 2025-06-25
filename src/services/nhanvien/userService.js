const { sql, connectDB } = require("../../config/db");

// Undo/Redo stacks (RAM only)
let undoStack = [];
let redoStack = [];

const getAllNhaDauTu = async (user) => {
  const pool = await connectDB(user.username, user.password);
  const result = await pool.request().query(`
    SELECT TOP (1000) [MaNDT], [HoTen], [NgaySinh], [MKGD], [DiaChi], [Phone], [CMND], [GioiTinh], [Email]
    FROM [QL_GiaoDichCoPhieu].[dbo].[NHADAUTU]
  `);
  return result.recordset.map((row) => {
    Object.keys(row).forEach(
      (k) => typeof row[k] === "string" && (row[k] = row[k].trim())
    );
    return row;
  });
};

const getAllNhanVien = async (user) => {
  const pool = await connectDB(user.username, user.password);
  const result = await pool.request().query(`
    SELECT TOP (1000) [MaNV], [HoTen], [NgaySinh], [DiaChi], [Phone], [CMND], [GioiTinh], [Email]
    FROM [QL_GiaoDichCoPhieu].[dbo].[NHANVIEN]
  `);
  return result.recordset.map((row) => {
    Object.keys(row).forEach(
      (k) => typeof row[k] === "string" && (row[k] = row[k].trim())
    );
    return row;
  });
};

const createAccount = async ({ login, password, username, role }, user) => {
  const pool = await connectDB(user.username, user.password);
  await pool
    .request()
    .input("Login", sql.VarChar, login)
    .input("Password", sql.VarChar, password)
    .input("Username", sql.VarChar, username)
    .input("Role", sql.VarChar, role)
    .execute("sp_TaoTaiKhoan");
  return { success: true, message: "Tạo tài khoản thành công" };
};

const deleteAccount = async ({ login, username }, user) => {
  const pool = await connectDB(user.username, user.password);
  await pool
    .request()
    .input("Login", sql.VarChar, login)
    .input("Username", sql.VarChar, username)
    .execute("sp_XoaTaiKhoan");
  return { success: true, message: "Xóa tài khoản thành công" };
};

const getUnregisteredNhaDauTu = async (user) => {
  const pool = await connectDB(user.username, user.password);
  const result = await pool.request().query(`
    SELECT 
      ndt.MaNDT, 
      ndt.HoTen
    FROM 
      dbo.NHADAUTU ndt
    WHERE 
      ndt.MaNDT NOT IN (
        SELECT name FROM sys.database_principals WHERE type = 'S'
      )
  `);
  return result.recordset.map((row) => {
    Object.keys(row).forEach(
      (k) => typeof row[k] === "string" && (row[k] = row[k].trim())
    );
    return row;
  });
};

const getUnregisteredNhanVien = async (user) => {
  const pool = await connectDB(user.username, user.password);
  const result = await pool.request().query(`
    SELECT 
      nv.MaNV, 
      nv.HoTen
    FROM 
      dbo.NHANVIEN nv
    WHERE 
      nv.MaNV NOT IN (
        SELECT name FROM sys.database_principals WHERE type = 'S'
      )
  `);
  return result.recordset.map((row) => {
    Object.keys(row).forEach(
      (k) => typeof row[k] === "string" && (row[k] = row[k].trim())
    );
    return row;
  });
};

const getRegisteredNhaDauTu = async (user) => {
  const pool = await connectDB(user.username, user.password);
  const result = await pool.request().query(`
    SELECT 
      ndt.MaNDT, 
      ndt.HoTen
    FROM 
      dbo.NHADAUTU ndt
    WHERE 
      ndt.MaNDT IN (
        SELECT name FROM sys.database_principals WHERE type = 'S'
      )
  `);
  return result.recordset.map((row) => {
    Object.keys(row).forEach(
      (k) => typeof row[k] === "string" && (row[k] = row[k].trim())
    );
    return row;
  });
};

const getRegisteredNhanVien = async (user) => {
  const pool = await connectDB(user.username, user.password);
  const result = await pool.request().query(`
    SELECT 
      nv.MaNV, 
      nv.HoTen
    FROM 
      dbo.NHANVIEN nv
    WHERE 
      nv.MaNV IN (
        SELECT name FROM sys.database_principals WHERE type = 'S'
      )
  `);
  return result.recordset.map((row) => {
    Object.keys(row).forEach(
      (k) => typeof row[k] === "string" && (row[k] = row[k].trim())
    );
    return row;
  });
};

const changePassword = async ({ username, newPassword }, user) => {
  const pool = await connectDB(user.username, user.password);
  const result = await pool
    .request()
    .input("Username", sql.VarChar, username)
    .input("NewPassword", sql.VarChar, newPassword)
    .execute("sp_DoiMatKhau");
  return {
    success: true,
    message: "Đổi mật khẩu thành công",
    returnValue: result.returnValue,
  };
};

const addNhaDauTu = async (user, data) => {
  const pool = await connectDB(user.username, user.password);
  await pool
    .request()
    .input("MaNDT", sql.NChar, data.MaNDT)
    .input("HoTen", sql.NVarChar, data.HoTen)
    .input("NgaySinh", sql.Date, data.NgaySinh)
    .input("MKGD", sql.NVarChar, data.MKGD)
    .input("DiaChi", sql.NVarChar, data.DiaChi)
    .input("Phone", sql.NVarChar, data.Phone)
    .input("CMND", sql.NChar, data.CMND)
    .input("GioiTinh", sql.NChar, data.GioiTinh)
    .input("Email", sql.NVarChar, data.Email)
    .execute("sp_ThemNhaDauTu");
  undoStack.push({ action: "addNDT", data });
  redoStack = [];
  return { success: true, message: "Thêm nhà đầu tư thành công" };
};

const updateNhaDauTu = async (user, data) => {
  const pool = await connectDB(user.username, user.password);
  // Lấy dữ liệu cũ để undo
  const old = await pool
    .request()
    .input("MaNDT", sql.NChar, data.MaNDT)
    .query(`SELECT * FROM NHADAUTU WHERE MaNDT = @MaNDT`);
  if (!old.recordset[0]) throw new Error("Không tìm thấy nhà đầu tư");
  await pool
    .request()
    .input("MaNDT", sql.NChar, data.MaNDT)
    .input("HoTen", sql.NVarChar, data.HoTen)
    .input("NgaySinh", sql.Date, data.NgaySinh)
    .input("MKGD", sql.NVarChar, data.MKGD)
    .input("DiaChi", sql.NVarChar, data.DiaChi)
    .input("Phone", sql.NVarChar, data.Phone)
    .input("CMND", sql.NChar, data.CMND)
    .input("GioiTinh", sql.NChar, data.GioiTinh)
    .input("Email", sql.NVarChar, data.Email).query(`
      UPDATE NHADAUTU
      SET HoTen=@HoTen, NgaySinh=@NgaySinh, MKGD=@MKGD, DiaChi=@DiaChi, Phone=@Phone, CMND=@CMND, GioiTinh=@GioiTinh, Email=@Email
      WHERE MaNDT=@MaNDT
    `);
  undoStack.push({
    action: "updateNDT",
    before: old.recordset[0],
    after: data,
  });
  redoStack = [];
  return { success: true, message: "Cập nhật nhà đầu tư thành công" };
};

const deleteNhaDauTu = async (user, MaNDT) => {
  const pool = await connectDB(user.username, user.password);
  // Lấy dữ liệu cũ để undo
  const old = await pool
    .request()
    .input("MaNDT", sql.NChar, MaNDT)
    .query(`SELECT * FROM NHADAUTU WHERE MaNDT = @MaNDT`);
  if (!old.recordset[0]) throw new Error("Không tìm thấy nhà đầu tư");
  await pool
    .request()
    .input("MaNDT", sql.NChar, MaNDT)
    .execute("sp_XoaNhaDauTu");
  undoStack.push({ action: "deleteNDT", data: old.recordset[0] });
  redoStack = [];
  return { success: true, message: "Xóa nhà đầu tư thành công" };
};

const addNhanVien = async (user, data) => {
  const pool = await connectDB(user.username, user.password);
  await pool
    .request()
    .input("MaNV", sql.NChar, data.MaNV)
    .input("HoTen", sql.NVarChar, data.HoTen)
    .input("NgaySinh", sql.Date, data.NgaySinh)
    .input("DiaChi", sql.NVarChar, data.DiaChi)
    .input("Phone", sql.NVarChar, data.Phone)
    .input("CMND", sql.NChar, data.CMND)
    .input("GioiTinh", sql.NChar, data.GioiTinh)
    .input("Email", sql.NVarChar, data.Email)
    .execute("sp_ThemNhanVien");
  undoStack.push({ action: "addNV", data });
  redoStack = [];
  return { success: true, message: "Thêm nhân viên thành công" };
};

const updateNhanVien = async (user, data) => {
  const pool = await connectDB(user.username, user.password);
  // Lấy dữ liệu cũ để undo
  const old = await pool
    .request()
    .input("MaNV", sql.NChar, data.MaNV)
    .query(`SELECT * FROM NHANVIEN WHERE MaNV = @MaNV`);
  if (!old.recordset[0]) throw new Error("Không tìm thấy nhân viên");
  await pool
    .request()
    .input("MaNV", sql.NChar, data.MaNV)
    .input("HoTen", sql.NVarChar, data.HoTen)
    .input("NgaySinh", sql.Date, data.NgaySinh)
    .input("DiaChi", sql.NVarChar, data.DiaChi)
    .input("Phone", sql.NVarChar, data.Phone)
    .input("CMND", sql.NChar, data.CMND)
    .input("GioiTinh", sql.NChar, data.GioiTinh)
    .input("Email", sql.NVarChar, data.Email).query(`
      UPDATE NHANVIEN
      SET HoTen=@HoTen, NgaySinh=@NgaySinh, DiaChi=@DiaChi, Phone=@Phone, CMND=@CMND, GioiTinh=@GioiTinh, Email=@Email
      WHERE MaNV=@MaNV
    `);
  undoStack.push({ action: "updateNV", before: old.recordset[0], after: data });
  redoStack = [];
  return { success: true, message: "Cập nhật nhân viên thành công" };
};

const deleteNhanVien = async (user, MaNV) => {
  const pool = await connectDB(user.username, user.password);
  // Lấy dữ liệu cũ để undo
  const old = await pool
    .request()
    .input("MaNV", sql.NChar, MaNV)
    .query(`SELECT * FROM NHANVIEN WHERE MaNV = @MaNV`);
  if (!old.recordset[0]) throw new Error("Không tìm thấy nhân viên");
  await pool.request().input("MaNV", sql.NChar, MaNV).execute("sp_XoaNhanVien");
  undoStack.push({ action: "deleteNV", data: old.recordset[0] });
  redoStack = [];
  return { success: true, message: "Xóa nhân viên thành công" };
};

const undo = async (user) => {
  if (undoStack.length === 0) throw new Error("Không có thao tác để undo");
  const last = undoStack.pop();
  const pool = await connectDB(user.username, user.password);
  let result;
  if (last.action === "addNDT") {
    // Undo thêm: xóa NĐT vừa thêm
    await pool
      .request()
      .input("MaNDT", sql.NChar, last.data.MaNDT)
      .execute("sp_XoaNhaDauTu");
    result = { success: true, message: "Đã undo thêm nhà đầu tư" };
  } else if (last.action === "updateNDT") {
    // Undo sửa: trả lại dữ liệu cũ
    const d = last.before;
    await pool
      .request()
      .input("MaNDT", sql.NChar, d.MaNDT)
      .input("HoTen", sql.NVarChar, d.HoTen)
      .input("NgaySinh", sql.Date, d.NgaySinh)
      .input("MKGD", sql.NVarChar, d.MKGD)
      .input("DiaChi", sql.NVarChar, d.DiaChi)
      .input("Phone", sql.NVarChar, d.Phone)
      .input("CMND", sql.NChar, d.CMND)
      .input("GioiTinh", sql.NChar, d.GioiTinh)
      .input("Email", sql.NVarChar, d.Email).query(`
        UPDATE NHADAUTU
        SET HoTen=@HoTen, NgaySinh=@NgaySinh, MKGD=@MKGD, DiaChi=@DiaChi, Phone=@Phone, CMND=@CMND, GioiTinh=@GioiTinh, Email=@Email
        WHERE MaNDT=@MaNDT
      `);
    result = { success: true, message: "Đã undo cập nhật nhà đầu tư" };
  } else if (last.action === "deleteNDT") {
    // Undo xóa: thêm lại NĐT
    const d = last.data;
    await pool
      .request()
      .input("MaNDT", sql.NChar, d.MaNDT)
      .input("HoTen", sql.NVarChar, d.HoTen)
      .input("NgaySinh", sql.Date, d.NgaySinh)
      .input("MKGD", sql.NVarChar, d.MKGD)
      .input("DiaChi", sql.NVarChar, d.DiaChi)
      .input("Phone", sql.NVarChar, d.Phone)
      .input("CMND", sql.NChar, d.CMND)
      .input("GioiTinh", sql.NChar, d.GioiTinh)
      .input("Email", sql.NVarChar, d.Email)
      .execute("sp_ThemNhaDauTu");
    result = { success: true, message: "Đã undo xóa nhà đầu tư" };
  } else if (last.action === "addNV") {
    // Undo thêm: xóa NV vừa thêm
    await pool
      .request()
      .input("MaNV", sql.NChar, last.data.MaNV)
      .execute("sp_XoaNhanVien");
    result = { success: true, message: "Đã undo thêm nhân viên" };
  } else if (last.action === "updateNV") {
    // Undo sửa: trả lại dữ liệu cũ
    const d = last.before;
    await pool
      .request()
      .input("MaNV", sql.NChar, d.MaNV)
      .input("HoTen", sql.NVarChar, d.HoTen)
      .input("NgaySinh", sql.Date, d.NgaySinh)
      .input("DiaChi", sql.NVarChar, d.DiaChi)
      .input("Phone", sql.NVarChar, d.Phone)
      .input("CMND", sql.NChar, d.CMND)
      .input("GioiTinh", sql.NChar, d.GioiTinh)
      .input("Email", sql.NVarChar, d.Email).query(`
        UPDATE NHANVIEN
        SET HoTen=@HoTen, NgaySinh=@NgaySinh, DiaChi=@DiaChi, Phone=@Phone, CMND=@CMND, GioiTinh=@GioiTinh, Email=@Email
        WHERE MaNV=@MaNV
      `);
    result = { success: true, message: "Đã undo cập nhật nhân viên" };
  } else if (last.action === "deleteNV") {
    // Undo xóa: thêm lại NV
    const d = last.data;
    await pool
      .request()
      .input("MaNV", sql.NChar, d.MaNV)
      .input("HoTen", sql.NVarChar, d.HoTen)
      .input("NgaySinh", sql.Date, d.NgaySinh)
      .input("DiaChi", sql.NVarChar, d.DiaChi)
      .input("Phone", sql.NVarChar, d.Phone)
      .input("CMND", sql.NChar, d.CMND)
      .input("GioiTinh", sql.NChar, d.GioiTinh)
      .input("Email", sql.NVarChar, d.Email)
      .execute("sp_ThemNhanVien");
    result = { success: true, message: "Đã undo xóa nhân viên" };
  }
  redoStack.push(last);
  return result;
};

const redo = async (user) => {
  if (redoStack.length === 0) throw new Error("Không có thao tác để redo");
  const last = redoStack.pop();
  const pool = await connectDB(user.username, user.password);
  let result;
  if (last.action === "addNDT") {
    // Redo thêm: thêm lại NĐT
    const d = last.data;
    await pool
      .request()
      .input("MaNDT", sql.NChar, d.MaNDT)
      .input("HoTen", sql.NVarChar, d.HoTen)
      .input("NgaySinh", sql.Date, d.NgaySinh)
      .input("MKGD", sql.NVarChar, d.MKGD)
      .input("DiaChi", sql.NVarChar, d.DiaChi)
      .input("Phone", sql.NVarChar, d.Phone)
      .input("CMND", sql.NChar, d.CMND)
      .input("GioiTinh", sql.NChar, d.GioiTinh)
      .input("Email", sql.NVarChar, d.Email)
      .execute("sp_ThemNhaDauTu");
    result = { success: true, message: "Đã redo thêm nhà đầu tư" };
  } else if (last.action === "updateNDT") {
    // Redo sửa: cập nhật lại dữ liệu mới
    const d = last.after;
    await pool
      .request()
      .input("MaNDT", sql.NChar, d.MaNDT)
      .input("HoTen", sql.NVarChar, d.HoTen)
      .input("NgaySinh", sql.Date, d.NgaySinh)
      .input("MKGD", sql.NVarChar, d.MKGD)
      .input("DiaChi", sql.NVarChar, d.DiaChi)
      .input("Phone", sql.NVarChar, d.Phone)
      .input("CMND", sql.NChar, d.CMND)
      .input("GioiTinh", sql.NChar, d.GioiTinh)
      .input("Email", sql.NVarChar, d.Email).query(`
        UPDATE NHADAUTU
        SET HoTen=@HoTen, NgaySinh=@NgaySinh, MKGD=@MKGD, DiaChi=@DiaChi, Phone=@Phone, CMND=@CMND, GioiTinh=@GioiTinh, Email=@Email
        WHERE MaNDT=@MaNDT
      `);
    result = { success: true, message: "Đã redo cập nhật nhà đầu tư" };
  } else if (last.action === "deleteNDT") {
    // Redo xóa: xóa lại NĐT
    await pool
      .request()
      .input("MaNDT", sql.NChar, last.data.MaNDT)
      .execute("sp_XoaNhaDauTu");
    result = { success: true, message: "Đã redo xóa nhà đầu tư" };
  } else if (last.action === "addNV") {
    // Redo thêm: thêm lại NV
    const d = last.data;
    await pool
      .request()
      .input("MaNV", sql.NChar, d.MaNV)
      .input("HoTen", sql.NVarChar, d.HoTen)
      .input("NgaySinh", sql.Date, d.NgaySinh)
      .input("DiaChi", sql.NVarChar, d.DiaChi)
      .input("Phone", sql.NVarChar, d.Phone)
      .input("CMND", sql.NChar, d.CMND)
      .input("GioiTinh", sql.NChar, d.GioiTinh)
      .input("Email", sql.NVarChar, d.Email)
      .execute("sp_ThemNhanVien");
    result = { success: true, message: "Đã redo thêm nhân viên" };
  } else if (last.action === "updateNV") {
    // Redo sửa: cập nhật lại dữ liệu mới
    const d = last.after;
    await pool
      .request()
      .input("MaNV", sql.NChar, d.MaNV)
      .input("HoTen", sql.NVarChar, d.HoTen)
      .input("NgaySinh", sql.Date, d.NgaySinh)
      .input("DiaChi", sql.NVarChar, d.DiaChi)
      .input("Phone", sql.NVarChar, d.Phone)
      .input("CMND", sql.NChar, d.CMND)
      .input("GioiTinh", sql.NChar, d.GioiTinh)
      .input("Email", sql.NVarChar, d.Email).query(`
        UPDATE NHANVIEN
        SET HoTen=@HoTen, NgaySinh=@NgaySinh, DiaChi=@DiaChi, Phone=@Phone, CMND=@CMND, GioiTinh=@GioiTinh, Email=@Email
        WHERE MaNV=@MaNV
      `);
    result = { success: true, message: "Đã redo cập nhật nhân viên" };
  } else if (last.action === "deleteNV") {
    // Redo xóa: xóa lại NV
    await pool
      .request()
      .input("MaNV", sql.NChar, last.data.MaNV)
      .execute("sp_XoaNhanVien");
    result = { success: true, message: "Đã redo xóa nhân viên" };
  }
  undoStack.push(last);
  return result;
};

module.exports = {
  getAllNhaDauTu,
  getAllNhanVien,
  createAccount,
  deleteAccount,
  getUnregisteredNhaDauTu,
  getUnregisteredNhanVien,
  getRegisteredNhaDauTu,
  getRegisteredNhanVien,
  changePassword,
  addNhaDauTu,
  updateNhaDauTu,
  deleteNhaDauTu,
  addNhanVien,
  updateNhanVien,
  deleteNhanVien,
  undo,
  redo,
};
