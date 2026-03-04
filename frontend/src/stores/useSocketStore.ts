// nên use ở file tổng app.tsx để chạy cùng lúc với app, cập nhật chính xác trạng thái online offline

import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,

  onlineUsers: [],

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

    // lắng nghe sự kiện (kết nối)
    socket.on("connect", () => {
      console.log("đã kết nối với socket");
    });

    // (online user) --> mỗi lần backend gửi danh sách online mới --> set lại store frontend giá trị đó
    socket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds }); // nhận đc userIds[] lưu vào store
    });
    // (new message)
    socket.on("new-message", ({ message, conversation, unreadCounts }) => {
      useChatStore.getState().addMessage(message); // thêm tin nhắn vào store

      // viết lại lastMessage theo fomat fontend
      const lastMessage = {
        _if: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        createdAt: conversation.lastMessage.createdAt,
        sender: {
          _id: conversation.lastMessage.senderId,
          displayName: "",
          avatarUrl: null,
        },
      };
      const updatedConversation = {
        ...conversation,
        lastMessage,
        unreadCounts,
      };

      // nếu user dang mở cuộc hội thoại
      if (
        useChatStore.getState().activeConversationId === message.conversationId
      ) {
        // đánh dấu đã đọc khi user đang mở convo đó mà đc đối phương gửi tin
        useChatStore.getState().markAsSeen();
      }
      // update conversation trong store
      useChatStore.getState().updateConversation(updatedConversation);
    });

    // (read-message) logic xử lý khi user đọc tin nhắn
    socket.on("read-message", ({ conversation, lastMessage }) => {
      // chứa thông tin cần cập nhật của convo
      const updated = {
        // ...conversation,
        // lastMessage,
        _id: conversation._id,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts,
        seenBy: conversation.seenBy,
      };
      // cập nhật lại convo trong store
      useChatStore.getState().updateConversation(updated);
    });
  },
  // ngắt kết nối khi log out hay rời khỏi app
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) socket.disconnect();
    set({ socket: null });
  },
}));
