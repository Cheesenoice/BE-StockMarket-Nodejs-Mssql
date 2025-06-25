const express = require("express");
const router = express.Router();
const stockController = require("../../controllers/nhadautu/stockController");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/stocks", authMiddleware("nhadautu"), stockController.getAllStocks);
router.get(
  "/stocks/:maCP/price",
  authMiddleware("nhadautu"),
  stockController.getStockPrice
);

module.exports = router;
