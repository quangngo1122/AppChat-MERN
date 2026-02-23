//

import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId, // id nguoi gui
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageL: {
      type: String, // tin nhan gui kem theo loi moi
      maxlength: 300, // gioi han so ky tu
    },
  },
  {
    timestamps: true,
  },
);

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true }); // 1 lời mời, ko gửi trùng 1 người 2 lần

friendRequestSchema.index({ from: 1 }); // truy vấn nhanh các lời mời kết bạn đã gửi
friendRequestSchema.index({ to: 1 }); // ... đã nhận

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
return FriendRequest;
