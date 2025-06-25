const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/nhadautu/orderController");
const authMiddleware = require("../../middleware/authMiddleware");

// Route đặt lệnh chỉ cho nhadautu
router.post("/order", authMiddleware("nhadautu"), orderController.placeOrder);
router.post(
  "/order/cancel",
  authMiddleware("nhadautu"),
  orderController.cancelOrder
);

router.get(
  "/order/pending",
  authMiddleware("nhadautu"),
  orderController.getPendingOrders
);

module.exports = router;
