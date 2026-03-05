import { friendService } from "@/services/friendService";
import type { FriendState } from "@/types/store";
import { create } from "zustand";

export const useFriendStore = create<FriendState>((set, get) => ({
  loading: false,
  searchByUserName: async (username) => {
    try {
      set({ loading: true });

      const user = await friendService.searchByUsername(username);

      return user;
    } catch (error) {
      console.error("Lỗi xãy ra khi tìm user bằng username", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  addFriend: async (to, message) => {
    try {
      set({ loading: true });
      // api add friend
      const resultMessage = await friendService.sendFriendRequest(to, message);

      return resultMessage;
    } catch (error) {
      console.error("Lỗi xãy ra khi addFriend");
      return "Lỗi xãy ra khi gửi kết bạn, hãy thử lại"; // return message hiển thị UI
    } finally {
      set({ loading: false });
    }
  },
}));
