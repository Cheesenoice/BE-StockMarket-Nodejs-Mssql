const orderService = require("../../services/nhadautu/orderService");

const placeOrder = async (req, res) => {
  try {
    const { maCP, ngay, loaiGD, soLuong, gia, maTK, loaiLenh, mkgd } = req.body;
    if (!maCP || !loaiGD || !soLuong || !maTK || !loaiLenh || !mkgd) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin cần thiết." });
    }
    // Ngày và giá có thể null tùy loại lệnh
    const result = await orderService.placeOrder(
      { maCP, ngay, loaiGD, soLuong, gia, maTK, loaiLenh, mkgd },
      req.user
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { maGD, mkgd } = req.body;
    if (!maGD || !mkgd) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin cần thiết." });
    }
    const result = await orderService.cancelOrder({ maGD, mkgd }, req.user);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPendingOrders = async (req, res) => {
  try {
    const data = await orderService.getPendingOrders(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  placeOrder,
  cancelOrder,
  getPendingOrders,
};
