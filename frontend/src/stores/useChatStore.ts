import { chatService } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
import { useSocketStore } from "./useSocketStore";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      //state
      conversations: [],
      messages: {},
      activeConversationId: null,
      convoLoading: false,

      messageLoading: false,
      loading: false,
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
      sendDirectMessage: async (recipientId, content, imgUrl) => {
        try {
          const { activeConversationId } = get();
          await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined,
          );
          // reset lại danh sách đã đọc, vì sẽ chưa ai đọc tin đó của mình
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }));
        } catch (error) {
          console.error("Lỗi xãy ra khi gửi direct message", error);
        }
      },
      sendGroupMessage: async (conversationId, content, imgUrl) => {
        try {
          await chatService.sendGroupMessage(conversationId, content, imgUrl);

          // reset danh sách đọc
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === get().activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }));
        } catch (error) {
          console.error("Lỗi xãy ra khi gửi group message", error);
        }
      },
      addMessage: async (message) => {
        try {
          const { user } = useAuthStore.getState();
          const { fetchMessages } = get();

          message.isOwn = message.senderId === user?._id;

          const convoId = message.conversationId;

          // danh sách tin nhắn hiện có --> nếu trc đó đã mở conversation, thì prev sẽ chứa các tin nhắn củ,
          // còn chưa mở conversation lần nào dù đc nhắn thì prev sẽ là mảng tin nhắn rỗng
          let prevItems = get().messages[convoId]?.items ?? [];

          if (prevItems.length === 0) {
            await fetchMessages(message.conversationId); // Nếu trong store hiện tại chưa có tin nhắn nào của conversation đó thì đi fetch từ server về.
            prevItems = get().messages[convoId]?.items ?? []; // Vì fetchMessages sẽ update state, nên sau khi fetch xong ta đọc lại dữ liệu mới trong store.
          }

          // ktra trong danh sách tin nhắn đã có tin nhắn này chưa
          set((state) => {
            if (prevItems.some((m) => m._id === message._id)) {
              return state;
            }

            // chưa có thì update thông tin
            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  // ghi đè item có key là convoId
                  items: [...prevItems, message],
                  hasMore: state.messages[convoId].hasMore,
                  nextCursor: state.messages[convoId].nextCursor ?? undefined,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xãy ra khi add message:", error);
        }
      },
      updateConversation: (conversation) => {
        // update state
        set((state) => ({
          conversations: state.conversations.map(
            (c) =>
              c._id === conversation._id
                ? { ...c, ...conversation } //  // tìm đúng conversation cần update, merge object cũ với object mới
                : c, // Nếu không phải conversation cần update → giữ nguyên.
          ),
        }));
      },
      markAsSeen: async () => {
        try {
          const { user } = useAuthStore.getState();
          const { activeConversationId, conversations } = get();
          if (!activeConversationId || !user) return;

          // tìm convo đc mở
          const convo = conversations.find(
            (c) => c._id === activeConversationId,
          );

          if (!convo) {
            return;
          }

          // kiểm tra unread --> nếu ko có tin nhắn chưa đọc thì thôi
          if ((convo.unreadCounts?.[user._id] ?? 0) === 0) {
            return;
          }
          // gọi api lưu trong service
          await chatService.markAsSeen(activeConversationId);

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId && c.lastMessage
                ? {
                    ...c,
                    unreadCounts: {
                      ...c.unreadCounts,
                      [user._id]: 0,
                    },
                  }
                : c,
            ),
          }));
        } catch (error) {
          console.error("Lỗi xảy ra khi gọi mark as seen", error);
        }
      },
      addConvo: (convo) => {
        set((state) => {
          // kiểm tra convo này có tồn tại lưu trong store chưa
          const exists = state.conversations.some(
            (c) => c._id.toString() === convo._id.toString(),
          );
          return {
            // tồn tại thì giữ nguyên / ko thì giải convo ra rồi thêm convo mới vào đầu mảng
            conversations: exists
              ? state.conversations
              : [convo, ...state.conversations],
            activeConversationId: convo._id, // UI hiển thị convo này luôn
          };
        });
      },

      createConversation: async (type, name, memberIds) => {
        try {
          set({ loading: true });
          const conversation = await chatService.createConversation(
            type,
            name,
            memberIds,
          );
          get().addConvo(conversation);

          // emit event join vào room socket
          useSocketStore
            .getState()
            .socket?.emit("join-conversation", conversation._id);
        } catch (error) {
          console.error(
            "Lỗi xãy ra khi gọi createconversation trong store",
            error,
          );
        } finally {
          set({ loading: false });
        }
      },

      addGroupMembers: async (conversationId: string, memberIds: string[]) => {
        try {
          set({ loading: true });
          const conversation = await chatService.addGroupMembers(
            conversationId,
            memberIds,
          );
          get().updateConversation(conversation);
        } catch (error) {
          console.error("Lỗi khi thêm thành viên vào nhóm", error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      removeConversation: (conversationId) => {
        // helper to clear conversation locally without network request
        set((state) => {
          const { [conversationId]: _removed, ...restMessages } =
            state.messages;
          return {
            conversations: state.conversations.filter(
              (c) => c._id !== conversationId,
            ),
            messages: restMessages,
            activeConversationId:
              state.activeConversationId === conversationId
                ? null
                : state.activeConversationId,
          } as any;
        });
      },

      deleteConversation: async (conversationId) => {
        try {
          set({ loading: true });
          await chatService.deleteConversation(conversationId);
          // remove locally as well
          get().removeConversation(conversationId);
        } catch (error) {
          console.error("Lỗi khi xoá conversation trong store", error);
        } finally {
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
