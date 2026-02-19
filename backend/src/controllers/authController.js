import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Session from "../models/Session.js";
import crypto from "crypto";

const ACCESS_TOKEN_TTL = "30m"; // thường dưới 15', o localhost này làm 30' cho dể test
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngay

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

export const signIn = async (req, res) => {
  try {
    // lay Input dc gui len tu client qua req.body
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        message: "Thiếu username hoac password",
      });
    }
    // lấy hashedPassword trong db so sánh với pass Input
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "username hoặc password không chính xác",
      });
    }
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword); // so sánh 2 pass có trùng nhau ko
    if (!passwordCorrect) {
      return res.status(401).json({
        message: "username hoặc password không chính xác",
      });
    }
    // nếu khớp, tạo accesstoken = JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    ); // payload - secrect key - option

    // tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // tạo session trong db mới để lưu refresh token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });
    // gửi refresh token về client qua trong cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // không thể bị truy cập bởi js
      secure: true, // đảm bảo chỉ gửi qua https
      sameSite: "none", // cho phép backend, frontend chạy trên 2 domain khác nhau
      maxAge: REFRESH_TOKEN_TTL,
    });

    // trả access token về trong res
    return res
      .status(200)
      .json({ message: `User ${user.displayName} da login`, accessToken });
  } catch (error) {
    console.log("loi khi goi signIp", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const signOut = async (req, res) => {
  try {
    // lấy refesh token từ cookie
    const token = req.cookies?.refreshToken;
    if (token) {
      // xóa refresh token trong Session --> access token thi xu ly o client
      await Session.deleteOne({ refreshToken: token });

      // xóa cookie
      res.clearCookie("refreshToken");
    }
    return res.sendStatus(204);
  } catch (error) {
    console.log("loi khi goi signOut", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};
