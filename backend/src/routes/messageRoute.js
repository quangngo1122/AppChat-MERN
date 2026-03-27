import express from "express";
import {
  sendDirectMessage,
  sendGroupMessage,
  uploadImage,
} from "../controllers/messageController.js";
import {
  checkFriendship,
  checkGroupMembership,
} from "../middleware/friendMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/direct", checkFriendship, sendDirectMessage);
router.post("/group", checkGroupMembership, sendGroupMessage);
router.post("/uploadImage", upload.single("file"), uploadImage);

export default router;
