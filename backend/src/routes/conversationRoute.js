import express from "express";
import {
  createConversation,
  getConversation,
  getMessage,
} from "../controllers/conversationController.js";
import { checkFriendship } from "../middleware/friendMiddleware.js";

const router = express.Router();

router.post("/", checkFriendship, createConversation);
router.get("/", getConversation);
router.get("/:conversationId/messages", getMessage);

export default router;
