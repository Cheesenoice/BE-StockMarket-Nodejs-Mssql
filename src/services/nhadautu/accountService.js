const { sql, connectDB } = require("../../config/db");

const getAccountsByNDT = async (user) => {
  try {
    if (!user || !user.username || !user.password) {
      throw new Error("Thông tin xác thực user không hợp lệ.");
    }
    const pool = await connectDB(user.username, user.password);
    const result = await pool
      .request()
      .input("MaNDT", sql.NChar, user.id)
      .execute("sp_GetAccountsByNDT");

    // Xử lý trim các trường NCHAR
    const data = result.recordset.map((acc) => ({
      ...acc,
      MaTK: acc.MaTK?.trim(),
      MaNDT: acc.MaNDT?.trim(),
      MaNH: acc.MaNH?.trim(),
    }));

    return data;
  } catch (err) {
    throw new Error("Không thể lấy danh sách tài khoản: " + err.message);
  }
};

const getAccountDetail = async (user, maTK) => {
  try {
    if (!user || !user.username || !user.password) {
      throw new Error("Thông tin xác thực user không hợp lệ.");
    }
    const pool = await connectDB(user.username, user.password);
    const result = await pool
      .request()
      .input("InputMaTK", sql.NChar, maTK)
      .input("InputMaNDT", sql.NChar, user.id)
      .execute("sp_TraCuuSoDu");

    // result.recordsets: [ [Bảng 1], [Bảng 2] ]
    const accountInfo = result.recordsets[0]?.[0] || {};
    const stocks = result.recordsets[1] || [];

    // Trim các trường NCHAR/NVARCHAR nếu cần
    if (accountInfo) {
      Object.keys(accountInfo).forEach(
        (k) =>
          typeof accountInfo[k] === "string" &&
          (accountInfo[k] = accountInfo[k].trim())
      );
    }
    stocks.forEach((row) => {
      Object.keys(row).forEach(
        (k) => typeof row[k] === "string" && (row[k] = row[k].trim())
      );
    });

    return { accountInfo, stocks };
  } catch (err) {
    throw new Error("Không thể tra cứu số dư: " + err.message);
  }
};

const getSaoKeGiaoDichLenh = async (user, maTK, tuNgay, denNgay) => {
  try {
    if (!user || !user.username || !user.password)
      throw new Error("Thông tin xác thực user không hợp lệ.");
    const pool = await connectDB(user.username, user.password);
    const result = await pool
      .request()
      .input("InputMaTK", sql.NChar, maTK)
      .input("InputMaNDT", sql.NChar, user.id)
      .input("TuNgay", sql.NVarChar, tuNgay || null)
      .input("DenNgay", sql.NVarChar, denNgay || null)
      .execute("sp_SaoKeGiaoDichLenh");
    return result.recordset.map((row) => {
      Object.keys(row).forEach(
        (k) => typeof row[k] === "string" && (row[k] = row[k].trim())
      );
      return row;
    });
  } catch (err) {
    throw new Error("Không thể lấy sao kê giao dịch lệnh: " + err.message);
  }
};

const getSaoKeGiaoDichLenhTheoMaCP = async (
  user,
  maTK,
  maCP,
  tuNgay,
  denNgay
) => {
  try {
    if (!user || !user.username || !user.password)
      throw new Error("Thông tin xác thực user không hợp lệ.");
    const pool = await connectDB(user.username, user.password);
    const result = await pool
      .request()
      .input("InputMaTK", sql.NChar, maTK)
      .input("InputMaCP", sql.NChar, maCP)
      .input("InputMaNDT", sql.NChar, user.id)
      .input("TuNgay", sql.NVarChar, tuNgay || null)
      .input("DenNgay", sql.NVarChar, denNgay || null)
      .execute("sp_SaoKeLenhDatTheoMaCP");
    return result.recordset.map((row) => {
      Object.keys(row).forEach(
        (k) => typeof row[k] === "string" && (row[k] = row[k].trim())
      );
      return row;
    });
  } catch (err) {
    throw new Error("Không thể lấy sao kê lệnh đặt theo mã CP: " + err.message);
  }
};

const getSaoKeGiaoDichTien = async (user, maTK, tuNgay, denNgay) => {
  try {
    if (!user || !user.username || !user.password)
      throw new Error("Thông tin xác thực user không hợp lệ.");
    const pool = await connectDB(user.username, user.password);
    const result = await pool
      .request()
      .input("InputMaTK", sql.NChar, maTK)
      .input("InputMaNDT", sql.NChar, user.id)
      .input("TuNgay", sql.NVarChar, tuNgay || null)
      .input("DenNgay", sql.NVarChar, denNgay || null)
      .execute("sp_SaoKeGiaoDichTien");
    return result.recordset.map((row) => {
      Object.keys(row).forEach(
        (k) => typeof row[k] === "string" && (row[k] = row[k].trim())
      );
      return row;
    });
  } catch (err) {
    throw new Error("Không thể lấy sao kê giao dịch tiền: " + err.message);
  }
};

const getSaoKeLenhKhop = async (user, maTK, tuNgay, denNgay) => {
  try {
    if (!user || !user.username || !user.password)
      throw new Error("Thông tin xác thực user không hợp lệ.");
    const pool = await connectDB(user.username, user.password);
    const result = await pool
      .request()
      .input("InputMaTK", sql.NChar, maTK)
      .input("InputMaNDT", sql.NChar, user.id)
      .input("TuNgay", sql.NVarChar, tuNgay || null)
      .input("DenNgay", sql.NVarChar, denNgay || null)
      .execute("sp_SaoKeLenhKhop");
    return result.recordset.map((row) => {
      Object.keys(row).forEach(
        (k) => typeof row[k] === "string" && (row[k] = row[k].trim())
      );
      return row;
    });
  } catch (err) {
    throw new Error("Không thể lấy sao kê lệnh khớp: " + err.message);
  }
};

const addAccount = async (user, { MaTK, MaNH }) => {
  if (!user || !user.username || !user.password || !user.id) {
    throw new Error("Thông tin xác thực user không hợp lệ.");
  }
  const pool = await connectDB(user.username, user.password);
  try {
    await pool
      .request()
      .input("MaNDT", sql.NChar, user.id)
      .input("MaTK", sql.NChar, MaTK)
      .input("MaNH", sql.NChar, MaNH)
      .execute("sp_ThemTaiKhoanNganHang");
    return { success: true, message: "Thêm tài khoản thành công" };
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

const deleteAccount = async (user, MaTK) => {
  if (!user || !user.username || !user.password || !user.id) {
    throw new Error("Thông tin xác thực user không hợp lệ.");
  }
  const pool = await connectDB(user.username, user.password);
  // Kiểm tra số dư
  const check = await pool
    .request()
    .input("MaTK", sql.NChar, MaTK)
    .input("MaNDT", sql.NChar, user.id)
    .query(
      `SELECT SoTien FROM TAIKHOAN_NGANHANG WHERE MaTK = @MaTK AND MaNDT = @MaNDT`
    );
  if (!check.recordset[0])
    throw new Error("Không tìm thấy tài khoản hoặc không thuộc quyền sở hữu.");
  if (check.recordset[0].SoTien !== 0)
    throw new Error("Chỉ được xóa tài khoản có số dư = 0.");
  // Xóa tài khoản
  await pool
    .request()
    .input("MaTK", sql.NChar, MaTK)
    .input("MaNDT", sql.NChar, user.id)
    .query(
      `DELETE FROM TAIKHOAN_NGANHANG WHERE MaTK = @MaTK AND MaNDT = @MaNDT`
    );
  return { success: true, message: "Xóa tài khoản thành công" };
};

const getAllBanks = async (user) => {
  if (!user || !user.username || !user.password) {
    throw new Error("Thông tin xác thực user không hợp lệ.");
  }
  const pool = await connectDB(user.username, user.password);
  const result = await pool
    .request()
    .query(
      `SELECT TOP (1000) [MaNH], [TenNH], [DiaChi], [Phone], [Email] FROM [QL_GiaoDichCoPhieu].[dbo].[NGANHANG]`
    );
  return result.recordset.map((row) => {
    Object.keys(row).forEach((k) => {
      if (typeof row[k] === "string") row[k] = row[k].trim();
    });
    return row;
  });
};

module.exports = {
  getAccountsByNDT,
  getAccountDetail,
  getSaoKeGiaoDichLenh,
  getSaoKeGiaoDichLenhTheoMaCP,
  getSaoKeGiaoDichTien,
  getSaoKeLenhKhop,
  addAccount,
  deleteAccount,
  getAllBanks,
};
