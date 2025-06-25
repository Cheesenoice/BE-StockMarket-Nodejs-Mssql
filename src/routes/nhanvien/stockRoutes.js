const express = require("express");
const router = express.Router();
const stockController = require("../../controllers/nhanvien/stockController");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/stocks", authMiddleware("nhanvien"), stockController.getAllStocks);
router.post("/stocks", authMiddleware("nhanvien"), stockController.addStock);
router.put(
  "/stocks/:maCP",
  authMiddleware("nhanvien"),
  stockController.updateStock
);
router.delete(
  "/stocks/:maCP",
  authMiddleware("nhanvien"),
  stockController.deleteStock
);
router.post("/stocks/undo", authMiddleware("nhanvien"), stockController.undo);
router.post("/stocks/redo", authMiddleware("nhanvien"), stockController.redo);

module.exports = router;
