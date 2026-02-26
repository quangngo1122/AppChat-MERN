// call api chat --> trả kq từ api

import api from "@/lib/axios";
import type { ConversationResponse, Message } from "@/types/chat";

export const chatService = {
  async fetchConversations(): Promise<ConversationResponse> {
    /* async nên trả về promise */
    const res = await api.get("/conversations");
    return res.data;
  },
};
