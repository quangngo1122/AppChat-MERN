import { uploadImagefromBuffer } from "../middleware/uploadMiddleware.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Session from "../models/Session.js";
import Friend from "../models/Friend.js";
import FriendRequest from "../models/FriendRequest.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { io } from "../socket/index.js";

export const authMe = async (req, res) => {
  try {
    const user = req.user; // lấy từ middleware, api nào đc middleware đó bọc vào thì dùng đc
    return res.status(200).json({ user });
  } catch (error) {
    console.log("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const test = async (req, res) => {
  return res.sendStatus(204);
};
// tìm user theo username --> kiểm tra xem user có tồn tại ko (thực tế: như zalo là search theo số điện thoại, này dùng usernane unique để dễ test )
export const searchUserByUsername = async (req, res) => {
  try {
    const { username } = req.query; // `/user/search?username=${username}`

    if (!username || username.trim() === "") {
      return req
        .status(400)
        .json({ message: "cần cung cấp username trong query" });
    }
    // query user
    const user = await User.findOne({ username }).select(
      "_id displayName username avatarUrl",
    );
    return res.status(200).json({ user });
  } catch (error) {
    console.error("LỖi xãy ra khi searchUserByUsername", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const file = req.file; // middleware
    const userId = req.user._id;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadImagefromBuffer(file.buffer); // buffer là dữ liệu ảnh lưu trong bộ nhớ

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatarUrl: result.secure_url,
        avatarId: result.public_id,
      },
      { new: true }, // trả về user đã đc cập nhật
    ).select("avatarUrl");

    if (!updatedUser.avatarUrl) {
      return res.status(400).json({ message: "Avatar trả về null" });
    }

    // ok thì trả về avt url
    return res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
  } catch (error) {
    console.error("Lỗi xãy ra khi upload avatar", error);
    return res.status(500).json({ message: "Avt upload failed" });
  }
};

// cập nhật thông tin cá nhân (displayName, username, email, phone, bio)
export const updatePersonalInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { displayName, username, email, phone, bio } = req.body;

    // build object cập nhật chỉ khi có giá trị
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName.trim();
    if (username !== undefined)
      updates.username = username.trim().toLowerCase();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone.trim();
    if (bio !== undefined) updates.bio = bio.trim();

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: "Không có trường nào để cập nhật" });
    }

    // Nếu đổi username/email thì phải đảm bảo không trùng
    if (updates.username) {
      const exist = await User.findOne({
        username: updates.username,
        _id: { $ne: userId }, // $ne -> "not equal" (không bằng)
      });
      if (exist) {
        return res.status(409).json({ message: "Username đã được sử dụng" });
      }
    }
    if (updates.email) {
      const exist = await User.findOne({
        email: updates.email,
        _id: { $ne: userId },
      });
      if (exist) {
        return res.status(409).json({ message: "Email đã được sử dụng" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("_id displayName username email phone bio avatarUrl");

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin cá nhân", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// thay đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Thiếu dữ liệu yêu cầu" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu mới không khớp" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const passwordCorrect = await bcrypt.compare(
      currentPassword,
      user.hashedPassword,
    );
    if (!passwordCorrect) {
      return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // hash mật khẩu mới và lưu
    const hashed = await bcrypt.hash(newPassword, 10);
    user.hashedPassword = hashed;
    await user.save();

    // tùy chọn: hủy tất cả phiên (refresh token) để log out các thiết bị khác
    await Session.deleteMany({ userId });

    return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// xóa tài khoản
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Xóa tất cả sessions của user
    await Session.deleteMany({ userId });

    // 2. Xóa tất cả friend requests liên quan (gửi hoặc nhận)
    await FriendRequest.deleteMany({
      $or: [{ from: userId }, { to: userId }],
    });

    // 3. Xóa tất cả friends liên quan
    await Friend.deleteMany({
      $or: [{ userA: userId }, { userB: userId }],
    });

    // 4. Xóa tất cả messages của user
    await Message.deleteMany({ senderId: userId });

    // 5. Xử lý conversations
    const conversations = await Conversation.find({
      "participants.userId": userId,
    });

    for (const conv of conversations) {
      const participantIds = conv.participants.map((p) => p.userId.toString());

      if (conv.type === "group") {
        // Remove user khỏi participants
        conv.participants = conv.participants.filter(
          (p) => p.userId.toString() !== userId.toString(),
        );

        if (conv.participants.length <= 1) {
          // if (conv.participants.length === 0) {

          // Nếu không còn ai, xóa conversation
          await Conversation.findByIdAndDelete(conv._id);

          participantIds.forEach((id) => {
            if (id !== userId.toString()) {
              io.to(id).emit("conversation-deleted", {
                conversationId: conv._id.toString(),
              });
            }
          });
        } else {
          // Cập nhật conversation
          await conv.save();

          // Emit tin nhắn cho các member còn lại (còn trong room)
          const updated = await Conversation.findById(conv._id)
            .populate("participants.userId", "displayName avatarUrl")
            .populate("lastMessage.senderId", "displayName avatarUrl")
            .lean();

          (conv.participants || []).forEach((p) => {
            const id = p.userId.toString();
            if (id !== userId.toString()) {
              io.to(id).emit("conversation-updated", updated);
            }
          });
        }
      } else if (conv.type === "direct") {
        // Xóa luôn direct conversation
        await Conversation.findByIdAndDelete(conv._id);

        participantIds.forEach((id) => {
          if (id !== userId.toString()) {
            io.to(id).emit("conversation-deleted", {
              conversationId: conv._id.toString(),
            });
          }
        });
      }
    }

    // 6. Xóa user
    await User.findByIdAndDelete(userId);

    return res
      .status(200)
      .json({ message: "Tài khoản đã được xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa tài khoản", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
