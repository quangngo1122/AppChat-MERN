import type { Socket } from "socket.io-client";
import type { Conversation, Message } from "./chat";
import type { User } from "./user";

// cấu trúc dữ liệu cho useAuthStore
export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;

  setAccessToken: (accessToken: string) => void;
  clearState: () => void; // ko trả về kdl j cả

  signUp: (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>; // hàm async nên trả về 1 promise (ko kdl), lỗi thì reject
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void; // chuyển qua lại sáng tối
  setTheme: (dark: boolean) => void; // cài theme khi app vừa load
}

export interface ChatState {
  conversations: Conversation[]; // danh sach cac cuoc hoi thoai --> mảng các conversation
  messages: Record<
    string, // Record map những cuộc hội thoại với tin nhắn của cuộc hội thoại đó, thay vì fetch tất cả tin nhắn lưu vào 1 mảng (nặng)
    {
      items: Message[]; // mảng các tin nhắn
      hasMore: boolean; // để biết có còn tin nhắn cũ chưa load ko --> infinite - scroll
      nextCursor?: string | null; // con trỏ phân trang, để biết load thêm tin nhắn ở khúc nào
    }
  >;
  activeConversationId: string | null; // lưu id cuộc trò truyện dang mở
  convoLoading: boolean;

  messageLoading: boolean;

  reset: () => void;
  setActiveConversation: (id: string | null) => void;

  fetchConversation: () => Promise<void>;
  fetchMessages: (conversations?: string) => Promise<void>;
  sendDirectMessage: (
    recipientId: string,
    content: string,
    imgUrl?: string,
  ) => Promise<void>;
  sendGroupMessage: (
    conversationId: string,
    content: string,
    imgUrl?: string,
  ) => Promise<void>;

  // add message --> để UI cập nhật danh sách tin nhắn cho đúng
  addMessage: (message: Message) => Promise<void>;
  // update convo --> sau khi thêm tin nhắn thì cập nhật lại 1 số thông tin convo vd: unreadcount, ...
  updateConversation: (conversation: Conversation) => void;
}

export interface SocketState {
  socket: Socket | null;

  onlineUsers: string[]; // mảng string chứa danh sách user online

  connectSocket: () => void;
  disconnectSocket: () => void;
}
