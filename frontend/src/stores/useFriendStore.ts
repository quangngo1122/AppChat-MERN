import { friendService } from "@/services/friendService";
import type { FriendState } from "@/types/store";
import { create } from "zustand";

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  loading: false,

  receivedList: [],
  sentList: [],

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
  getAllFriendRequests: async () => {
    try {
      set({ loading: true });

      const result = await friendService.getAllFriendRequest();

      if (!result) return;

      const { received, sent } = result;

      set({ receivedList: received, sentList: sent });
    } catch (error) {
      console.error("Lỗi xãy ra khi getAllFriendRequests", error);
    } finally {
      set({ loading: false });
    }
  },

  addReceivedFriendRequest: (request) => {
    set((state) => ({
      receivedList: [request, ...(state.receivedList || [])],
    }));
  },

  acceptRequest: async (requestId) => {
    try {
      set({ loading: true });
      await friendService.acceptRequest(requestId);
      // nếu yc đc chấp nhận, thì xóa yc đó khỏi danh sách đã nhận
      set((state) => ({
        receivedList: state.receivedList.filter((r) => r._id !== requestId),
      }));
    } catch (error) {
      console.error("Lỗi xãy ra khi acceptRequest", error);
    } finally {
      set({ loading: false });
    }
  },

  declineRequest: async (requestId) => {
    try {
      set({ loading: true });
      await friendService.declineRequest(requestId);

      set((state) => ({
        receivedList: state.receivedList.filter((r) => r._id !== requestId),
      }));
    } catch (error) {
      console.error("Lỗi xãy ra khi declineRequest", error);
    } finally {
      set({ loading: false });
    }
  },
  getFriends: async () => {
    try {
      set({ loading: true });
      const friends = await friendService.getFriendList();
      set({ friends: friends });
    } catch (error) {
      console.error("Lỗi xãy ra khi load friends", error);
      set({ friends: [] });
    } finally {
      set({ loading: false });
    }
  },
}));
