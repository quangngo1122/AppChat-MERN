import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
// dotenv.config({ quiet: true }); // nếu muốn tắt log dotenv khỏi terminal
dotenv.config();
import authRoute from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoute.js";
import { protectedRoute } from "./middleware/authMiddleware.js";
import cors from "cors";
import friendRoute from "./routes/friendRoute.js";
import messageRoute from "./routes/messageRoute.js";
import conversationRoute from "./routes/conversationRoute.js";

const app = express();
const PORT = process.env.PORT || 5001;

// middleware
app.use(express.json()); // giup hiểu và đọc req body dưới dạng json
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true })); // credentials: true --> Cho phép gửi: Cookie, HTTP-only cookie , Authorization header ,Session

//public routes
app.use("/api/auth", authRoute);
// private routes
app.use(protectedRoute); // để middle ở đây thì api private đc bảo vệ, cách 2 là gắn trực tiếp vào route api (sau đường dẫn và trc hàm api)--> route nào đc gắn thì api đó cần accesstoken mới dùng đc
app.use("/api/users", userRoute);
app.use("/api/friends", friendRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);
//connect DB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server bat dau tren cong ${PORT}`);
  });
});
