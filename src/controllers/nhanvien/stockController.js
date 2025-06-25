const stockService = require("../../services/nhanvien/stockService");

const getAllStocks = async (req, res) => {
  try {
    const data = await stockService.getAllStocks(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addStock = async (req, res) => {
  try {
    const { MaCP, TenCty, DiaChi, SoLuongPH } = req.body;
    if (!MaCP || !TenCty || !DiaChi || !SoLuongPH) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin." });
    }
    const result = await stockService.addStock(req.user, {
      MaCP,
      TenCty,
      DiaChi,
      SoLuongPH,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const { maCP } = req.params;
    const { TenCty, DiaChi, SoLuongPH } = req.body;
    if (!TenCty || !DiaChi || !SoLuongPH) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin." });
    }
    const result = await stockService.updateStock(req.user, maCP, {
      TenCty,
      DiaChi,
      SoLuongPH,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteStock = async (req, res) => {
  try {
    const { maCP } = req.params;
    const result = await stockService.deleteStock(req.user, maCP);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const undo = async (req, res) => {
  try {
    const result = await stockService.undo(req.user);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const redo = async (req, res) => {
  try {
    const result = await stockService.redo(req.user);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllStocks,
  addStock,
  updateStock,
  deleteStock,
  undo,
  redo,
};
