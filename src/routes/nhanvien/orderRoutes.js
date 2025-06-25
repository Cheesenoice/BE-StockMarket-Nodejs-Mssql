const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/nhanvien/orderController");
const authMiddleware = require("../../middleware/authMiddleware");

router.get(
  "/lenhdat",
  authMiddleware("nhanvien"),
  orderController.handleGetAllLenhDat
);
router.get(
  "/lenhkhop",
  authMiddleware("nhanvien"),
  orderController.handleGetAllLenhKhop
);
router.get(
  "/lichsutien",
  authMiddleware("nhanvien"),
  orderController.handleGetAllLichSuTien
);
router.post(
  "/ato",
  authMiddleware("nhanvien"),
  orderController.handleExecuteATO
);
router.post(
  "/atc",
  authMiddleware("nhanvien"),
  orderController.handleExecuteATC
);

module.exports = router;
