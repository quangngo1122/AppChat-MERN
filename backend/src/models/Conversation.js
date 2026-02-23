// đại diện cho 1 cuộc hội thoại

import mongoose, { mongo } from "mongoose";

// schema phụ mô tả thông tin cơ bản người dùng trong cuộc trò truyện
const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false, // lo tự động tạo id riêng, vì đây là schema phụ bỗ xung cho schema chính chứ ko phải bảng riêng
  },
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String, // tên nhóm
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // người tạo ra nhóm
      ref: "User",
    },
  },
  {
    _id: false,
  },
);

const lastMessageSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // id tin nhan gốc
    },
    content: {
      type: String,
      default: null,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"], // gioi han gia tri co the co
      required: true,
    },
    participants: {
      type: [participantSchema], // một mảng chứa danh sách những người tham gia hội thoại, mỗi phần tử tuân theo participantSchema (schema phụ)
      required: true,
    },
    group: {
      type: groupSchema, //  áp dụng cho các cuộc hội thoại nhóm
    },
    lastMessageAt: {
      type: Date, // thoi gian tin nhan cuoi trong hoi thoai
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }, // danh sach id nhung nguoi da seen tin nhan
    ],
    lastMessage: {
      type: lastMessageSchema, // hien thi noi dung tin nhan cuoi ở thanh hội thoại nhỏ
    },
    unreadCounts: {
      type: Map, // kdl Map, luu so tin nhan chua doc cua tung user
      of: Number, // value la number
      default: {},
    },
  },
  {
    timestamps: true,
  },
);
// tạo compound index để truy vấn danh sách chat nhanh hơn
conversationSchema.index({
  "participant.userId": 1, // tạo một bản tra cứu nhanh, sắp sếp theo người tham gia
  lastMessageAt: -1, // tin nhắn người đó sẽ đc lấy ra tin nhắn mới
});

// tao modelConversation
const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
