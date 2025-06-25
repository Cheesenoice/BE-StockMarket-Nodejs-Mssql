const {
  getAllLenhDat,
  getAllLenhKhop,
  getAllLichSuTien,
  executeATO,
  executeATC,
} = require("../../services/nhanvien/orderService");

const handleGetAllLenhDat = async (req, res) => {
  try {
    const data = await getAllLenhDat(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleGetAllLenhKhop = async (req, res) => {
  try {
    const data = await getAllLenhKhop(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleGetAllLichSuTien = async (req, res) => {
  try {
    const data = await getAllLichSuTien(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleExecuteATO = async (req, res) => {
  try {
    const result = await executeATO(req.user);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleExecuteATC = async (req, res) => {
  try {
    const result = await executeATC(req.user);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  handleGetAllLenhDat,
  handleGetAllLenhKhop,
  handleGetAllLichSuTien,
  handleExecuteATO,
  handleExecuteATC,
};
