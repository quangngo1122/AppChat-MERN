import express from "express";
import {
  authMe,
  searchUserByUsername,
  test,
} from "../controllers/userController.js";
// import { protectedRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMe);
// router.get("/me", protectedRoute, authMe);

router.get("/test", test);

router.get("/search", searchUserByUsername);

export default router;
