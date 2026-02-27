// giao diện chat

import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import ChatWindowSkeleton from "./ChatWindowSkeleton";
import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";

const ChatWindowLayout = () => {
  const {
    activeConversationId,
    conversations,
    messageLoading: loading,
    messages,
  } = useChatStore();

  // xác định cuộc trò truyện đang đc chọn
  const selectedConvo =
    conversations.find((c) => c._id === activeConversationId) ?? null;

  // 3 giao diện 3 trường hợp:

  // Nếu chưa chọn convo nào "/", hiện giao diện chào
  if (!selectedConvo) {
    return <ChatWelcomeScreen />;
  }

  // 2 nếu đang loading tin nhắn chưa xong --> hiển thị giao diện load tin nhắn
  if (loading) {
    return <ChatWindowSkeleton />;
  }

  // 3 bth
  return (
    <SidebarInset className="flex flex-col h-full overflow-hidden flex-1 rounded-sm shadow-md">
      {/* Header --> tên, avt */}
      <ChatWindowHeader chat={selectedConvo} />

      {/* body --> danh sách tin nhắn */}
      <div className="flex-1 overflow-y-auto bg-primary-foreground ">
        <ChatWindowBody />
      </div>

      {/* footer --> thanh chat */}
      <MessageInput selectedConvo={selectedConvo} />
    </SidebarInset>
  );
};

export default ChatWindowLayout;
