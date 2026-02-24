import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// tạo 1 cuộc trò truyện mới (đơn, nhóm)
export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds } = req.body; // loại chat, tên nhóm chat, danh sách thành viên
    const userId = req.user._id;
    if (
      !type || // thiếu type, group ko name, ko có member, memberid ko phải 1 mảng, mảng memberid rỗng
      (type === "group" && !name) ||
      !memberIds ||
      !Array.isArray(memberIds) ||
      memberIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Tên nhóm và danh sach thành viên là bắt buộc" });
    }

    let conversation;

    if (type === "direct") {
      const participantId = memberIds[0];
      conversation = await Conversation.findOne({
        type: "direct",
        // cách truy vấn vào mãng participants mà userId thỏa điều kiện
        "participants.userId": { $all: [userId, participantId] },
      });

      // nếu 2 người chưa chat nhau lần nào --> tạo phòng chat mới
      if (!conversation) {
        conversation = new Conversation({
          type: "direct",
          participants: [{ userId }, { userId: participantId }],
          lastMessageAt: new Date(),
        });
        await conversation.save();
      }
    }
    if (type === "group") {
      // tạo group conversation thì khỏi ktra, mặc định tạo mới khi gọi api này
      conversation = new Conversation({
        type: "group",
        participants: [
          { userId },
          ...memberIds.map((id) => ({
            userId: id,
          })),
        ],
        group: {
          name,
          createdBy: userId,
        },
        lastMessageAt: new Date(),
      });
      await conversation.save(); // luu vao db
    }

    if (!conversation) {
      return res.status(400).json({ message: "Conversation type ko hợp lệ" }); // type ko phải 1 trong 2 thì báo lỗi này
    }

    await conversation.populate([
      { path: "participants.userId", select: "displayName avatarUrl" }, // trong trg participants trả thêm displayName avatarUrl
      { path: "seenBy", select: "displayName avatarUrl" }, // displayName avatarUrl những người đã seen tin nhắn
      { path: "lastMessage.senderId", select: "displayName avatarUrl" }, // người gửi tin cuối cùng
    ]);

    return res.status(201).json({ conversation });
  } catch (error) {
    console.error("Lỗi khi tạo conversation", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getConversation = async (req, res) => {
  try {
  } catch (error) {
    console.error("");
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMessage = async (req, res) => {
  try {
  } catch (error) {
    console.error("");
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
