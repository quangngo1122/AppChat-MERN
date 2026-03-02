// socket io cực ở bước setup, dùng thì dể hơn

// lắng nghe, nhận: [  .on  ]
// gửi phát : [  .emit  ]

import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketMiddleWare } from "../middleware/socketMiddleWare.js";

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

// lắng nghe sự kiện kết nối --> sau khi lắng nghe đc sự kết nối thì chạy hàm
io.on("connection", async (socket) => {
  const user = socket.user;

  console.log(`${user.displayName} online với socket ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`socket disconnected: ${socket.id}`);
  });
});

export { io, app, server };
