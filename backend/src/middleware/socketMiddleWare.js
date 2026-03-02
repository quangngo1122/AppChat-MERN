import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const socketMiddleWare = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized - Token không tồn tại"));
    }

    // xem token có đc giải ra khởi key secret ko
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded) {
      return next(
        new Error("Unauthorized - Token không hợp lệ hoặc đã hết hạn"),
      );
    }

    // khi token hợp lệ thì tìm user theo decoded userId
    const user = await User.findById(decoded.userId).select("-hashedPassword");
    // nếu user lp tồn tại thì từ chối kết nối
    if (!user) {
      return next(new Error("User không tồn tại"));
    }
    // nếu có thì gắn user lên socket để tất cả event socket dều biết user là ai
    socket.user = user;
    // use ở file config socket
    next();
  } catch (error) {
    console.error("Lỗi khi verify JWT trong socketMiddleware", error);
    return next(new Error("Unauthorized"));
  }
};
