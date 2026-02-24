// middleware kiểm tra quan hệ bạn bè trước khi cho phép làm gì đó

import Conversation from "../models/Conversation.js";
import Friend from "../models/Friend.js";

// hàm hoán đổi--> sắp xếp thứ tự uA, uB 1 cách nhất quán
const pair = (a, b) => (a < b ? [a, b] : [b, a]);

export const checkFriendship = async (req, res, next) => {
  try {
    const me = req.user._id.toString();
    const recipientId = req.body?.recipientId ?? null; // id người muốn chat

    const memberIds = req.body?.memberIds ?? [];

    if (!recipientId && memberIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Cần cung cấp recipientId hoặc memberIds" });
    }
    // kiểm tra friend chat 1-1
    if (recipientId) {
      const [userA, userB] = pair(me, recipientId); // so sánh 2 id để chuấn hóa vị trí
      const isFriend = await Friend.findOne({ userA, userB }); // có thì là bạn
      if (!isFriend) {
        return res
          .status(403)
          .json({ message: "Bạn chưa kết bạn với người này" });
      }
      return next(); // nếu ok hết --> cho request đi tiếp đến controller chính.
    }

    // kiểm tra friend chat nhóm:
    const friendChecks = memberIds.map(async (memberId) => {
      const [userA, userB] = pair(me, memberId); // chuẩn hóa thứ tự
      const friend = await Friend.findOne({ userA, userB }); // xem 2 người có mối quan hệ bạn bè chưa
      return friend ? null : memberId;
    });

    const results = await Promise.all(friendChecks); // đợi tất cả truy vấn bên trên hoàn thành rồi lưu vào results
    const notFriends = results.filter(Boolean); // lọc ra những phần tử có giá trị true (friend ? null : memberIds;)

    if (notFriends.length > 0) {
      return res.status(403).json({
        message: "Bạn chỉ có thể thêm bạn bè của bạn vào nhóm",
        notFriends, // có ít nhất 1 người ko phải bạn thì ko tạo nhóm đc
      });
    }
    next(); // ok hết thì tiếp tục
  } catch (error) {
    console.error("Lỗi xãy ra khi checkFriendship", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
