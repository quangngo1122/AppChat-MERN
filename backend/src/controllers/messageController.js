import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import {
  emitNewMessage,
  updateConversationAfterCreateMessage,
} from "../utils/messageHelper.js";
import { io } from "../socket/index.js";
import { uploadImagefromBuffer } from "../middleware/uploadMiddleware.js";

// gửi tin nhắn cho cá nhân
export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, conversationId, imgUrl } = req.body; // id người nhận, nd, id cuộ hội thoại
    const senderId = req.user._id; // id người dùng gửi tin nhắn (hiểu đơn giản là mình)

    let conversation;

    if (!content && !imgUrl) {
      return res.status(400).json({ message: "Thiếu nội dung" });
    }
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }
    // nếu ko tìm thấy --> tạo conversation mới
    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: recipientId, joinedAt: new Date() },
        ],
        lastMessageAt: new Date(),
        unreadCounts: new Map(),
      });
    }

    // sau khi đã có cuộc hội thoại, tiến hành tạo tin nhắn mới
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
      imgUrl,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    emitNewMessage(io, conversation, message);

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xãy ra khi gửi tin nhắn trực tiếp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// gửi tin nhắn nhóm
export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content, imgUrl } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation; // từ checkGroupMembership middleware

    if (!content && !imgUrl) {
      return res.status(400).json("Thiếu nội dung");
    }

    // tạo tin nhắn
    const message = await Message.create({
      conversationId,
      senderId,
      content,
      imgUrl,
    });

    // cap nhat lai thong tin cuoc tro truyen
    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    emitNewMessage(io, conversation, message);

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xãy ra khi gửi tin nhắn nhóm", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// upload ảnh cho tin nhắn
export const uploadImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadImagefromBuffer(file.buffer, {
      // ghi đè setting
      folder: "q_chat/messages",
      resource_type: "image",

      // transformation: [{ width: 300, height: 200, crop: "fill" }],

      transformation: [{ height: 200, crop: "fill" }],
    });

    return res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error("Lỗi xãy ra khi upload ảnh tin nhắn", error);
    return res.status(500).json({ message: "Upload ảnh thất bại" });
  }
};
