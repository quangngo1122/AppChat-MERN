import { chatService } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      //state
      conversations: [],
      messages: {},
      activeConversationId: null,
      loading: false,
      //func
      setActiveConversation: (id) => set({ activeConversationId: id }),
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          loading: false,
        });
      },
      fetchConversation: async () => {
        // dùng ngay sau khi user đăng nhập thành công useAuthStore
        try {
          set({ loading: true });
          const { conversations } = await chatService.fetchConversations();
          // cập nhật state
          set({ conversations, loading: false });
        } catch (error) {
          console.error("Lỗi xãy ra khi fetchConversations", error);
          set({ loading: false });
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }), // lưu danh sách chat lên localS thôi, mấy cái như đã mở phòng chat nào thì reset lại
    },
  ),
);
