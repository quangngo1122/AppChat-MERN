import { uploadImagefromBuffer } from "../middleware/uploadMiddleware.js";
import User from "../models/User.js";

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
