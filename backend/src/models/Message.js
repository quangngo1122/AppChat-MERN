// lưu từng tin nhắn giữa 2 người dùng

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId, // id cuoc tro truyen
      ref: "Conversation", // Tham chieu toi bang Conversation
      required: true,
      index: true, // toi uu toc do tim tin nhan
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    imgUrl: {
      type: String,
    },
  },
  { timestamps: true },
);

//index kết hợp (index custom)
messageSchema.index({ conversationId: 1, createdAt: -1 }); // 1 sắp xếp theo chiều tăng dần, và ngược lại, tức là tin nhắn mới nhất nằm trên cùng

//tạo modelMessage
const Message = mongoose.model("Message", messageSchema);
export default Message;
