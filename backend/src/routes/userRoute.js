import express from "express";
import { authMe, test } from "../controllers/userController.js";
// import { protectedRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMe);
// router.get("/me", protectedRoute, authMe);

router.get("/test", test);

export default router;
