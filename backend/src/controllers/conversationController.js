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

// Lấy danh sách các cuộc trò chuyện (conversations) mà user hiện tại đang tham gia --> Trả về dữ liệu đã được format lại
export const getConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      "participants.userId": userId, // lấy những conversation mà trong mảng participants chứa user này
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate({
        path: "participants.userId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "lastMessage.senderId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "seenBy",
        select: "displayName avatarUrl",
      });

    // format lại cho frontend dễ dùng --> Tránh trả về cấu trúc quá phức tạp, Tránh lộ dữ liệu không cần thiết
    const formatted = conversations.map((convo) => {
      const participants = (convo.participants || []).map((p) => ({
        _id: p.userId?._id, // giữ lại những field frontend cần.
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      }));

      return {
        ...convo.toObject(), // chuyển mongooseDoc --> obj thông thường
        unreadCounts: convo.unreadCounts || {},
        participants: participants, // ghi đè lại giá trị sau khi format
      };
    });

    return res.status(200).json({ conversations: formatted });
  } catch (error) {
    console.error("Lỗi xãy ra khi lấy conversation", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// lấy toàn bộ tin nhắn trong cuộc hội thoại, frontend dùng làm hiển thị chi tiết chat
export const getMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query; // ở đường dẫn sau dấu [?] VD: >> /..?litmit=${pageLimit}&cursor=${cursor} << là query
    const query = { conversationId };

    // nếu load thêm tin nhắn cũ
    if (cursor) {
      // query những tin cũ hơn thời điểm hiện tại
      query.createAt = { $lt: new Date(cursor) }; // $lt là [ < ]
    }

    // truy vấn message theo điều kiện trong query
    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1); // lấy dư 1 tin để kiểm tra xem còn trang kế tiếp ko

    let nextCursor = null;

    // nếu số lượng tin nhắn nhiều hơn limit thì load thêm
    if (messages.length > Number(limit)) {
      const nextMessage = messages[messages.length - 1]; // lấy tin nhắn cuối, tin nhắn thứ 51
      nextCursor = nextMessage.createdAt.toISOString(); // đánh dấu vị trí phân trang tiếp theo, (time tạo của tin nhắn thứ 51)

      messages.pop(); // tin nhắn dư kiểm tra xong r thì bỏ tin nhắn đó để hiện đúng mỗi lần 50 tin
    }

    //đảo ngược thứ tự, để hiển thị đúng thứ tự tin nhắn
    messages = messages.reverse();
    return res.status(200).json({ messages, nextCursor });
  } catch (error) {
    console.error("Lỗi xãy ra khi lấy messages", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getUserConversationForSocketIO = async (userId) => {
  try {
    // lấy danh sách conversation id
    const conversations = await Conversation.find(
      { "participants.userId": userId },
      { _id: 1 }, // lấy đúng trường id thôi, vì hàm này cần nhiêu đó nên tránh query nhiều
    );

    // convert từng id sang dạng string để dể thao tác
    return conversations.map((c) => c._id.toString());
  } catch (error) {
    console.error("Lỗi xãy ra khi fetch conversation", error);
    return [];
  }
};
