import express from "express";
import {
  authMe,
  searchUserByUsername,
  test,
  uploadAvatar,
  updatePersonalInfo,
  changePassword,
} from "../controllers/userController.js";
import { upload } from "../middleware/uploadMiddleware.js";

import { protectedRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protectedRoute, authMe);

// cập nhật thông tin cá nhân
router.patch("/me", protectedRoute, updatePersonalInfo);

// Đổi mật khẩu
router.patch("/me/password", protectedRoute, changePassword);

router.get("/test", test);

router.get("/search", searchUserByUsername);

// middle sẽ tìm trường có tên file trong res body -> đọc file vào memory
// sau đó gán dữ liệu thô vào res.file trước khi chuyển qua hàm controler
router.post("/uploadAvatar", upload.single("file"), uploadAvatar);

export default router;
