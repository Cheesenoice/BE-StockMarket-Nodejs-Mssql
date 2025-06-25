const express = require("express");
const router = express.Router();
const userController = require("../../controllers/nhanvien/userController");
const authMiddleware = require("../../middleware/authMiddleware");

router.get(
  "/nhadautu",
  authMiddleware("nhanvien"),
  userController.getNhaDauTuList
);
router.get(
  "/nhanvien",
  authMiddleware("nhanvien"),
  userController.getNhanVienList
);
router.get(
  "/unregistered-nhadautu",
  authMiddleware("nhanvien"),
  userController.handleGetUnregisteredNhaDauTu
);
router.get(
  "/unregistered-nhanvien",
  authMiddleware("nhanvien"),
  userController.handleGetUnregisteredNhanVien
);
router.get(
  "/registered-nhadautu",
  authMiddleware("nhanvien"),
  userController.handleGetRegisteredNhaDauTu
);
router.get(
  "/registered-nhanvien",
  authMiddleware("nhanvien"),
  userController.handleGetRegisteredNhanVien
);
router.post(
  "/create",
  authMiddleware("nhanvien"),
  userController.handleCreateAccount
);
router.post(
  "/delete",
  authMiddleware("nhanvien"),
  userController.handleDeleteAccount
);
router.post(
  "/change-password",
  authMiddleware("nhanvien"),
  userController.handleChangePassword
);
router.post(
  "/nhadautu/add",
  authMiddleware("nhanvien"),
  userController.handleAddNhaDauTu
);
router.put(
  "/nhadautu/update",
  authMiddleware("nhanvien"),
  userController.handleUpdateNhaDauTu
);
router.delete(
  "/nhadautu/delete/:id",
  authMiddleware("nhanvien"),
  userController.handleDeleteNhaDauTu
);

router.post(
  "/nhanvien/add",
  authMiddleware("nhanvien"),
  userController.handleAddNhanVien
);
router.put(
  "/nhanvien/update",
  authMiddleware("nhanvien"),
  userController.handleUpdateNhanVien
);
router.delete(
  "/nhanvien/delete/:id",
  authMiddleware("nhanvien"),
  userController.handleDeleteNhanVien
);

router.post(
  "/undo-user",
  authMiddleware("nhanvien"),
  userController.handleUndoUser
);
router.post(
  "/redo-user",
  authMiddleware("nhanvien"),
  userController.handleRedoUser
);

module.exports = router;
