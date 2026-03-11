import express from "express";
import {
  createConversation,
  getConversation,
  getMessage,
  maskAsSeen,
  deleteConversation,
} from "../controllers/conversationController.js";
import { checkFriendship } from "../middleware/friendMiddleware.js";

const router = express.Router();

router.post("/", checkFriendship, createConversation);
router.get("/", getConversation);
router.get("/:conversationId/messages", getMessage);

router.patch("/:conversationId/seen", maskAsSeen); // update

// xoá cuộc trò chuyện (cả conversation lẫn messages)
router.delete("/:conversationId", deleteConversation);

export default router;
