const orderService = require("../services/orderService");

const placeOrder = async (req, res) => {
  try {
    const { maCP, ngay, loaiGD, soLuong, gia, maTK } = req.body;
    if (!maCP || !ngay || !loaiGD || !soLuong || !gia || !maTK) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin cần thiết." });
    }
    const result = await orderService.placeOrder(
      { maCP, ngay, loaiGD, soLuong, gia, maTK },
      req.user
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { placeOrder };
