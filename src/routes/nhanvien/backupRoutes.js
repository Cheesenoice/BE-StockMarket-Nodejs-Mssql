const express = require("express");
const router = express.Router();
const backupController = require("../../controllers/nhanvien/backupController");
const authMiddleware = require("../../middleware/authMiddleware");

router.get(
  "/databases",
  authMiddleware("nhanvien"),
  backupController.listDatabases
);
router.post(
  "/device",
  authMiddleware("nhanvien"),
  backupController.createDevice
);
router.post(
  "/backup",
  authMiddleware("nhanvien"),
  backupController.backupDatabase
);
router.post(
  "/backup-log",
  authMiddleware("nhanvien"),
  backupController.backupLog
);
router.get(
  "/backups/:dbName",
  authMiddleware("nhanvien"),
  backupController.listBackups
);
router.post(
  "/restore",
  authMiddleware("nhanvien"),
  backupController.restoreDatabase
);
router.post(
  "/restore-time",
  authMiddleware("nhanvien"),
  backupController.restoreDatabaseToTime
);

// routes/nhanvien/backupRoutes.js
router.get(
  "/log-files/:dbName",
  authMiddleware("nhanvien"),
  backupController.listLogFiles
);

module.exports = router;
