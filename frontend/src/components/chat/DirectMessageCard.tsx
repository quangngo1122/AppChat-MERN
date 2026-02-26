import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import UnreadCountBadge from "./UnreadCountBadge";

const DirectMessageCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const {
    activeConversationId,
    setActiveConversation,
    messages,
    fetchMessages,
  } = useChatStore();

  if (!user) {
    return null;
  }
  // tìm người user đang nói truyện cùng --> người khác id mình trong participants
  const otherUser = convo.participants.find((p) => p._id !== user._id);
  if (!otherUser) {
    return null;
  }
  // lấy số lượng tin nhắn chưa dọc của user
  const unreadCount = convo.unreadCounts[user._id];
  // nd tin nhắn cuối nếu có
  const lastMessage = convo.lastMessage?.content ?? "";
  // hàm xử lý khi nhấp vào ô hội thoại conversations
  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    // nếu convo đó chưa có tin nhắn
    if (!messages[id]) {
      // gọi api fetch messages
      await fetchMessages();
    }
  };

  return (
    <ChatCard
      convoId={convo._id}
      name={otherUser.displayName ?? ""}
      timestamp={
        convo.lastMessage?.createdAt
          ? new Date(convo.lastMessage.createdAt)
          : undefined
      }
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={
        <>
          {/* user avt */}
          <UserAvatar
            type="sidebar"
            name={otherUser.displayName ?? ""}
            avatarUrl={otherUser.avatarUrl ?? undefined}
          />
          {/* status badge /* todo: xử lý status khi nào thao tác socket io */}
          <StatusBadge status="offline" />
          {/* unread count */}
          {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
        </>
      }
      subtitle={
        <p
          className={cn(
            "text-sm truncate",
            unreadCount > 0
              ? "font-medium text-foreground"
              : "text-muted-foreground",
          )}
        >
          {lastMessage}
        </p>
      }
    />
  );
};

export default DirectMessageCard;

// ngoài thay vì dùng cn từ tailwind-merge trong until có thể dùng `` trong class để xét điều kiện để xác dịnh style tailwind
