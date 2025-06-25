const {
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
} = require("../../services/nhanvien/userService");

const getNhaDauTuList = async (req, res) => {
  try {
    const data = await getAllNhaDauTu(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getNhanVienList = async (req, res) => {
  try {
    const data = await getAllNhanVien(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleCreateAccount = async (req, res) => {
  try {
    const { login, password, username, role } = req.body;
    if (!login || !password || !username || !role) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin." });
    }
    const result = await createAccount(
      { login, password, username, role },
      req.user
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleDeleteAccount = async (req, res) => {
  try {
    const { login, username } = req.body;
    if (!login || !username) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin." });
    }
    const result = await deleteAccount({ login, username }, req.user);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleGetUnregisteredNhaDauTu = async (req, res) => {
  try {
    const data = await getUnregisteredNhaDauTu(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleGetUnregisteredNhanVien = async (req, res) => {
  try {
    const data = await getUnregisteredNhanVien(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleChangePassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin." });
    }
    const result = await changePassword({ username, newPassword }, req.user);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleAddNhaDauTu = async (req, res) => {
  try {
    const result = await addNhaDauTu(req.user, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleUpdateNhaDauTu = async (req, res) => {
  try {
    const result = await updateNhaDauTu(req.user, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleDeleteNhaDauTu = async (req, res) => {
  try {
    const MaNDT = req.params.id;
    const result = await deleteNhaDauTu(req.user, MaNDT);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleAddNhanVien = async (req, res) => {
  try {
    const result = await addNhanVien(req.user, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleUpdateNhanVien = async (req, res) => {
  try {
    const result = await updateNhanVien(req.user, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleDeleteNhanVien = async (req, res) => {
  try {
    const MaNV = req.params.id;
    const result = await deleteNhanVien(req.user, MaNV);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleGetRegisteredNhaDauTu = async (req, res) => {
  try {
    const data = await getRegisteredNhaDauTu(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleGetRegisteredNhanVien = async (req, res) => {
  try {
    const data = await getRegisteredNhanVien(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleUndoUser = async (req, res) => {
  try {
    const result = await undo(req.user);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleRedoUser = async (req, res) => {
  try {
    const result = await redo(req.user);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getNhaDauTuList,
  getNhanVienList,
  handleCreateAccount,
  handleDeleteAccount,
  handleGetUnregisteredNhaDauTu,
  handleGetUnregisteredNhanVien,
  handleChangePassword,
  handleAddNhaDauTu,
  handleUpdateNhaDauTu,
  handleDeleteNhaDauTu,
  handleAddNhanVien,
  handleUpdateNhanVien,
  handleDeleteNhanVien,
  handleGetRegisteredNhaDauTu,
  handleGetRegisteredNhanVien,
  handleUndoUser,
  handleRedoUser,
};
