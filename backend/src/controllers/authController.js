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
          "Không thể thiếu username, password, email, firstName, lastName",
      });
    }
    // kiem tra xem user tòn tại chưa
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json({
        message: "user đã tồn tại",
      }); // nếu user đã tồn tại --> thông báo
    }
    // nếu chưa --> mã hóa pass
    const hashedPassword = await bcrypt.hash(password, 10); // mã hóa pass gốc 2^10 lần, thường dùng 10 hoặc 12
    // tạo user mới
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${lastName} ${firstName}`,
    });
    // return
    return res.sendStatus(204);
  } catch (error) {
    console.log("lỗi khi gọi signUp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signIn = async (req, res) => {
  try {
    // lay Input dc gui len tu client qua req.body
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        message: "Thiếu username hoặc password",
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
      .json({ message: `User ${user.displayName} đã login`, accessToken });
  } catch (error) {
    console.log("loi khi goi signIp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signOut = async (req, res) => {
  try {
    // lấy refesh token từ cookie
    const token = req.cookies?.refreshToken;
    if (token) {
      // xóa refresh token trong Session --> access token thì xử lý ở client
      await Session.deleteOne({ refreshToken: token });

      // xóa cookie
      res.clearCookie("refreshToken");
    }
    return res.sendStatus(204);
  } catch (error) {
    console.log("lỗi khi gọi signOut", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// tao accessToken mới tu refresh token
export const refreshToken = async (req, res) => {
  try {
    // lay refreshToken tu cookie
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại" });
    }
    // so sánh refreshT trong db
    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
    // kiểm tra refreshT hết hạn chưa --> nếu time hết hạn < time hiện tại ==> hết hạn
    if (session.expiresAt < new Date()) {
      return res.status(403).json({ message: "Token đã hết hạn" });
    }
    // nếu chưa tạo accesstoken mới
    const accessToken = jwt.sign(
      {
        userId: session.userId,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );
    // return
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.log("Lỗi khi gọi refreshToken", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
