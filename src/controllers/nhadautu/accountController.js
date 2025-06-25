const accountService = require("../../services/nhadautu/accountService");
const {
  getAccountsByNDT,
  getAccountDetail,
  getSaoKeGiaoDichLenh,
  getSaoKeGiaoDichLenhTheoMaCP,
  getSaoKeGiaoDichTien,
  getSaoKeLenhKhop,
} = accountService;

const getMyAccounts = async (req, res) => {
  try {
    const accounts = await getAccountsByNDT(req.user);
    res.json({ success: true, data: accounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAccountDetailById = async (req, res) => {
  try {
    const maTK = req.params.id;
    if (!maTK) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu mã tài khoản." });
    }
    const detail = await getAccountDetail(req.user, maTK);
    res.json({ success: true, data: detail });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const saoKeGiaoDichLenh = async (req, res) => {
  try {
    const { id } = req.params;
    const { maCP, tuNgay, denNgay } = req.query;
    let data;
    if (maCP) {
      data = await getSaoKeGiaoDichLenhTheoMaCP(
        req.user,
        id,
        maCP,
        tuNgay,
        denNgay
      );
    } else {
      data = await getSaoKeGiaoDichLenh(req.user, id, tuNgay, denNgay);
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const saoKeGiaoDichTien = async (req, res) => {
  try {
    const { id } = req.params;
    const { tuNgay, denNgay } = req.query;
    const data = await getSaoKeGiaoDichTien(req.user, id, tuNgay, denNgay);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const saoKeLenhKhop = async (req, res) => {
  try {
    const { id } = req.params;
    const { tuNgay, denNgay } = req.query;
    const data = await getSaoKeLenhKhop(req.user, id, tuNgay, denNgay);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addAccountForNDT = async (req, res) => {
  try {
    const { MaTK, MaNH } = req.body;
    if (!MaTK || !MaNH) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin." });
    }
    const result = await accountService.addAccount(req.user, { MaTK, MaNH });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAccountForNDT = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu mã tài khoản." });
    }
    const result = await accountService.deleteAccount(req.user, id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllBanks = async (req, res) => {
  try {
    const data = await accountService.getAllBanks(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getMyAccounts,
  getAccountDetailById,
  saoKeGiaoDichLenh,
  saoKeGiaoDichTien,
  saoKeLenhKhop,
  addAccountForNDT,
  deleteAccountForNDT,
  getAllBanks,
};
