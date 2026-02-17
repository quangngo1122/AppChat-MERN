import bcrypt from "bcrypt";
import User from "../models/User";

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "không thể thiếu username, password, email, firstName, lastName",
      });
    }
    // kiem tra xem user tòn tại chưa
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json({
        message: "user da ton tai",
      }); // nếu user đã tồn tại --> thông báo
    }
    // nếu chưa --> mã hóa pass
    const hashedPassword = await bcrypt.hash(password, 10); // ma hoa pass goc 2^10 lan, thuong dung 10 hoac 12

    // tạo user mới
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });
    // return
    return res.sendStatus(204);
  } catch (error) {
    console.log("loi khi goi signUp", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};
