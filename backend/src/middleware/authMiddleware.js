import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = (req, res, next) => {
  // next khi gặp nó sẽ chuyển tiếp sang luồn midd tiếp theo hoặc API tiếp đó
  try {
    //lấy accessToken từ header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer ...<token>...

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy accessToken" });
    }
    // xác nhận token hợp lệ
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedUser) => {
        // nhận về err nếu sai và nếu đúng sẽ giải ra đc decodedUser có chứa userId
        if (err) {
          console.error(err);
          return res
            .status(403)
            .json({ message: "accessToken hết hạn hoặc không đúng" });
        }
        // tìm user
        const user = await User.findById(decodedUser.userId).select(
          "-hashedPassword",
        ); // lấy tất cả thông tin user trừ mk
        if (!user) {
          return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        // trả user về trong req
        req.user = user; // gắn thông tin vào req.user để các midd hoặc route phía sau có thể tái sử dụng lại

        next(); // xác nhận middleware đã hoàn thành, qua phần tiếp theo
      },
    );
  } catch (error) {
    console.error("lỗi khi xác minh JWT trong authMiddleware", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
