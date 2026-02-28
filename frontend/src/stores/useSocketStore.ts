// nên use ở file tổng app.tsx để chạy cùng lúc với app, cập nhật chính xác trạng thái online offline

import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  // tạo socket và connect lên server
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    // lấy state socket hiện tại
    const existingSocket = get().socket;
    if (existingSocket) return; // nếu đã có r thì return sớm, tránh tạo nhiều kết nối trùng nhau

    const socket: Socket = io(baseURL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    set({ socket });

    // lắng nghe sự kiện
    socket.on("connect", () => {
      console.log("đã kết nối với socket");
    });
  },
  // ngắt kết nối khi log out hay rời khỏi app
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) socket.disconnect();
    set({ socket: null });
  },
}));
