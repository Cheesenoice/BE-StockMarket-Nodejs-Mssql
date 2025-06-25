const express = require("express");
const router = express.Router();
const accountController = require("../../controllers/nhadautu/accountController");
const authMiddleware = require("../../middleware/authMiddleware");

router.get(
  "/accounts",
  authMiddleware("nhadautu"),
  accountController.getMyAccounts
);

router.get(
  "/accounts/:id",
  authMiddleware("nhadautu"),
  accountController.getAccountDetailById
);

router.get(
  "/accounts/:id/sao-ke-giao-dich-lenh",
  authMiddleware("nhadautu"),
  accountController.saoKeGiaoDichLenh
);

router.get(
  "/accounts/:id/sao-ke-giao-dich-tien",
  authMiddleware("nhadautu"),
  accountController.saoKeGiaoDichTien
);

router.get(
  "/accounts/:id/sao-ke-lenh-khop",
  authMiddleware("nhadautu"),
  accountController.saoKeLenhKhop
);

router.post(
  "/accounts",
  authMiddleware("nhadautu"),
  accountController.addAccountForNDT
);

router.delete(
  "/accounts/:id",
  authMiddleware("nhadautu"),
  accountController.deleteAccountForNDT
);

router.get("/banks", authMiddleware("nhadautu"), accountController.getAllBanks);

module.exports = router;
