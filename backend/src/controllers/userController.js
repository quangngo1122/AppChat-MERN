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
