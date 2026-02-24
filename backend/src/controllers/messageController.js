import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";

// gửi tin nhắn cho cá nhân
export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, conversationId } = req.body; // id người nhận, nd, id cuộ hội thoại
    const senderId = req.user._id; // id người dùng gửi tin nhắn (hiểu đơn giản là mình)

    let conversation;

    if (!content) {
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
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xãy ra khi gửi tin nhắn trực tiếp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// gửi tin nhắn nhóm
export const sendGroupMessage = async (req, res) => {
  try {
  } catch (error) {
    console.error("Loi khi lay danh sach yeu cau ket ban");
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
