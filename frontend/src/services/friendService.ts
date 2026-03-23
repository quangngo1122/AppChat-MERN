import api from "@/lib/axios";

export const friendService = {
  async searchByUsername(username: string) {
    const res = await api.get(`/users/search?username=${username}`);
    return res.data.user;
  },

  async sendFriendRequest(to: string, message?: string) {
    const res = await api.post("/friends/requests", {
      to,
      message,
    });
    // return res.data.message;
    return res.data.request;
  },

  // lấy toàn bộ lời mời kb đã nhận
  async getAllFriendRequest() {
    try {
      const res = await api.get("/friends/requests");
      const { sent, received } = res.data;

      return { sent, received };
    } catch (error) {
      console.error("Lỗi khi gửi getallfriendrequest", error);
    }
  },

  // đồng ý
  async acceptRequest(requestId: string) {
    try {
      const res = await api.post(`/friends/requests/${requestId}/accept`);
      return res.data.requestAcceptedBy;
    } catch (error) {
      console.error("Lỗi khi gửi acceptRequest", error);
    }
  },

  // từ chối
  async declineRequest(requestId: string) {
    try {
      await api.post(`/friends/requests/${requestId}/decline`);
    } catch (error) {
      console.error("Lỗi khi gửi declineRequest", error);
    }
  },

  // thu hồi lời mời kết bạn
  async cancelRequest(requestId: string) {
    try {
      await api.delete(`/friends/requests/${requestId}`);
    } catch (error) {
      console.error("Lỗi khi thu hồi lời mời kết bạn", error);
      throw error;
    }
  },

  // lấy danh sách tất cả bạn bè
  async getFriendList() {
    const res = await api.get("/friends");
    return res.data.friends;
  },
};
