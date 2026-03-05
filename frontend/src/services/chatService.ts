// call api chat --> trả kq từ api

import api from "@/lib/axios";
import type { ConversationResponse, Message } from "@/types/chat";

interface fetchMessageProps {
  messages: Message[]; // mảng chứa danh sách tin nhắn
  cursor?: string; // con trỏ phân trang
}

const pageLimit = 20;

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

  async markAsSeen(conversationId: string) {
    const res = await api.patch(`/conversations/${conversationId}/seen`);
    return res.data;
  },
};
