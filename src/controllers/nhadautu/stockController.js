const stockService = require("../../services/nhadautu/stockService");

const getAllStocks = async (req, res) => {
  try {
    const data = await stockService.getAllStocks(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStockPrice = async (req, res) => {
  try {
    const { maCP } = req.params;
    if (!maCP) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu mã cổ phiếu." });
    }
    const data = await stockService.getStockPrice(req.user, maCP);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllStocks, getStockPrice };
