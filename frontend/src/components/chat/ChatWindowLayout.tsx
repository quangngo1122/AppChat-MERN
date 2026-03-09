// giao diện chat

import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";

import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";
import { useEffect } from "react";
import ChatWindowSkeleton from "../skeleton/ChatWindowSkeleton";

const ChatWindowLayout = () => {
  const {
    activeConversationId,
    conversations,
    messageLoading: loading,
    markAsSeen,
  } = useChatStore();

  // xác định cuộc trò truyện đang đc chọn
  const selectedConvo =
    conversations.find((c) => c._id === activeConversationId) ?? null;

  useEffect(() => {
    if (!selectedConvo) {
      return;
    }
    // nếu đã chọn convo thì gọi hàm
    const markSeen = async () => {
      try {
        await markAsSeen();
      } catch (error) {
        console.error("Lỗi khi markSeen", error);
      }
    };
    markSeen();
  }, [markAsSeen, selectedConvo]);
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
