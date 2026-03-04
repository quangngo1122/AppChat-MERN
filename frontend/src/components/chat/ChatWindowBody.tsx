import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import MessageItem from "./MessageItem";
import { useEffect, useState } from "react";

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
  } = useChatStore();

  // (1) ktra tin đã đọc hay chưa
  const [lastMessageStatus, setLastMessageStatus] = useState<
    "delivered" | "seen"
  >("delivered");

  // tin nhắn từ những cuộc hội thoại đang actve
  const messages = allMessages[activeConversationId!]?.items ?? []; // abc! --> non null --> báo rằng chắc chắn biến này KHÔNG phải null
  // tìm convo đang đc mở
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId,
  );

  useEffect(() => {
    const lastMessage = selectedConvo?.lastMessage;
    if (!lastMessage) {
      return;
    }
    const seenBy = selectedConvo?.seenBy ?? [];
    // nếu đã có người đọc
    setLastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");
  }, [selectedConvo]);

  if (!selectedConvo) {
    return <ChatWelcomeScreen />; // chưa mở cái nào thì hiện cái này
  }

  // nếu trong convo ko có tin nhắn nào
  if (!messages?.length) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Chưa có tin nhắn nào trong cuộc trò truyện nảy.
      </div>
    );
  }

  return (
    <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
      <div className="flex flex-col overflow-y-auto overflow-x-hidden beautiful-scrollbar">
        {messages.map((message, index) => (
          <MessageItem
            key={message._id ?? index}
            message={message}
            index={index}
            messages={messages}
            selectedConvo={selectedConvo}
            lastMessageStatus={lastMessageStatus}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatWindowBody;

// beautiful-scrollbar: tự custom thanh cuộn đẹp hơn
