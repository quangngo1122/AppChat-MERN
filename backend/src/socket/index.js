// socket io cực ở bước setup, dùng thì dể hơn

// lắng nghe, nhận: [  .on  ]
// gửi phát : [  .emit  ]

import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketMiddleWare } from "../middleware/socketMiddleWare.js";
import { getUserConversationForSocketIO } from "../controllers/conversationController.js";

// tạo express
const app = express();
// tạo http server
const server = http.createServer(app);

// tạo socket
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL, // cấu hình cors để frontend kết nối đc
    credentials: true,
  },
});

// use middleware socket
io.use(socketMiddleWare);

// *1 xử lý sự kiện online / offline --> backend lưu lại danh sách user on, mỗi khi có người on/off gửi lại danh sách mới cho tất cả ngừi dùng
const onlineUsers = new Map(); // keys: values --> userId: socketId  --> dùng cho app nhở/ vừa, lớn nên dùng "redis"

// lắng nghe sự kiện kết nối --> sau khi lắng nghe đc sự kết nối thì chạy hàm
io.on("connection", async (socket) => {
  const user = socket.user;

  console.log(`${user.displayName} online với socket ${socket.id}`);

  onlineUsers.set(user._id, socket.id); //*1

  // *1 thông báo cho client danh sách người online
  io.emit("online-users", Array.from(onlineUsers.keys()));

  // lấy ra danh sách conversation id
  const conversationIds = await getUserConversationForSocketIO(user._id);
  // cho user join vào từng room tương ứng --> các room trò truyện nào thì thông báo những người trong room đó --> chỉ cần emit vào đúng room
  conversationIds.forEach((id) => {
    socket.join(id);
  });

  socket.on("disconnect", () => {
    // *1 thông báo cho client lại danh sách người online
    onlineUsers.delete(user._id); // xóa user khỏi map
    io.emit("online-users", Array.from(onlineUsers.keys()));

    console.log(`socket disconnected: ${socket.id}`);
  });
});

export { io, app, server };
