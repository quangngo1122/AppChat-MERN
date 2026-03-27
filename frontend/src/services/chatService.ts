// call api chat --> trả kq từ api

import api from "@/lib/axios";
import type { ConversationResponse, Message } from "@/types/chat";

interface fetchMessageProps {
  messages: Message[]; // mảng chứa danh sách tin nhắn
  cursor?: string; // con trỏ phân trang
}

const pageLimit = 50;

export const chatService = {
  async fetchConversations(): Promise<ConversationResponse> {
    /* async nên trả về promise */
    const res = await api.get("/conversations");
    return res.data;
  },
  async fetchMessages(id: string, cursor?: string): Promise<fetchMessageProps> {
    const res = await api.get(
      `/conversations/${id}/messages?limit=${pageLimit}&cursor=${cursor}`,
    );
    return { messages: res.data.messages, cursor: res.data.nextCursor };
  },

  // gửi tin nhắn đơn
  async sendDirectMessage(
    recipientId: string,
    content: string = "",
    imgUrl?: string,
    conversationId?: string,
  ) {
    const res = await api.post("/messages/direct", {
      recipientId,
      content,
      imgUrl,
      conversationId,
    });
    return res.data.message;
  },

  // gửi tin nhắn nhóm
  async sendGroupMessage(
    conversationId: string,
    content: string = "",
    imgUrl?: string,
  ) {
    const res = await api.post("/messages/group", {
      conversationId,
      content,
      imgUrl,
    });
    return res.data.message;
  },

  // upload ảnh cho tin nhắn
  async uploadImage(formData: FormData) {
    const res = await api.post("/messages/uploadImage", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.imageUrl;
  },

  async markAsSeen(conversationId: string) {
    const res = await api.patch(`/conversations/${conversationId}/seen`);
    return res.data;
  },

  // dùng để tạo conversation mới khi chọn vào bạn bè trong danh sách kết bạn
  async createConversation(
    type: "direct" | "group",
    name: string,
    memberIds: string[],
  ) {
    const res = await api.post("/conversations", { type, name, memberIds });
    return res.data.conversation;
  },

  async deleteConversation(conversationId: string) {
    const res = await api.delete(`/conversations/${conversationId}`);
    return res.data;
  },
};
