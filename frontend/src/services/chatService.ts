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
};
