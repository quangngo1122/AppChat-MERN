// "/api/friends"

import express from "express";
import {
  acceptFriendRequest,
  sendFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  getAllFriends,
  getFriendRequests,
} from "../controllers/friendController.js";

const router = express.Router();

router.post("/requests", sendFriendRequest); // gui yeu cau kb
router.post("/requests/:requestId/accept", acceptFriendRequest); // chap nhan loi moi, :Dynamic parameters (tham số động)
router.post("/requests/:requestId/decline", declineFriendRequest); // tu choi loi moi

router.delete("/requests/:requestId", cancelFriendRequest); // thu hoi loi moi ket ban

router.get("/", getAllFriends);
router.get("/requests", getFriendRequests);

export default router;
