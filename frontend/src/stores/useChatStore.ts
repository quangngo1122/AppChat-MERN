import { chatService } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      //state
      conversations: [],
      messages: {},
      activeConversationId: null,
      convoLoading: false,

      messageLoading: false,
      //func
      setActiveConversation: (id) => set({ activeConversationId: id }),
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoLoading: false,
          messageLoading: false,
        });
      },
      fetchConversation: async () => {
        // dùng ngay sau khi user đăng nhập thành công useAuthStore
        try {
          set({ convoLoading: true });
          const { conversations } = await chatService.fetchConversations();
          // cập nhật state
          set({ conversations, convoLoading: false });
        } catch (error) {
          console.error("Lỗi xãy ra khi fetchConversations", error);
          set({ convoLoading: false });
        }
      },

      // gọi khi click vào ô conversation direct / group message card
      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages } = get();
        const { user } = useAuthStore.getState(); // để biết ai đang đăng nhập

        const convoId = conversationId ?? activeConversationId;

        if (!convoId) return; // ko có luôn thì dừng

        const current = messages?.[convoId]; // tin nhắn cuộc trò truyện hiện tại
        const nextCursor =
          current?.nextCursor === undefined ? "" : current?.nextCursor;

        if (nextCursor === null) return; // hết tin nhắn cũ r thì dừng fetch thêm, ko thêm đoạn này có thể gây fetch những tin nhắn đã lấy r

        set({ messageLoading: true });

        // gọi dữ liệu api
        try {
          const { messages: fetched, cursor } = await chatService.fetchMessages(
            convoId,
            nextCursor,
          );

          // đánh dấu tin nào của user -> map qua từng tin nhắn trong arr messages ktra
          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId === user?._id, // tin nhắn của mình thì thêm isOwn = true
          }));

          set((state) => {
            // danh sách tin nhắn cũ
            const prev = state.messages[convoId]?.items ?? [];
            // gộp tin mới
            const merged =
              prev.length > 0 ? [...processed, ...prev] : processed;

            return {
              messages: {
                ...state.messages, // giữ nguyên dữ liệu cuộc trò truyện khác

                [convoId]: {
                  items: merged, // danh sách tin nhắn sau khi merged
                  hasMore: !!cursor, // còn load đc ko --> về dạng boolean
                  nextCursor: cursor ?? null,
                }, // ghi đè convo hiện tại
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchMessages:", error);
        } finally {
          set({ messageLoading: false });
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }), // lưu danh sách chat lên localS thôi, mấy cái như đã mở phòng chat nào thì reset lại
    },
  ),
);
