import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import MessageItem from "./MessageItem";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
    fetchMessages,
  } = useChatStore();

  // (1) ktra tin đã đọc hay chưa
  const [lastMessageStatus, setLastMessageStatus] = useState<
    "delivered" | "seen"
  >("delivered");

  // tin nhắn từ những cuộc hội thoại đang actve
  const messages = allMessages[activeConversationId!]?.items ?? []; // abc! --> non null --> báo rằng chắc chắn biến này KHÔNG phải null

  // đão chiều DOM hiển thị messages --> ko thì phải đão chiều dữ liệu bên backend để làm skien load thêm tin ko bị xung dột sự kiện scroll xuống tin mới nhất trước
  const reversedMessages = [...messages].reverse();
  const hasMore = allMessages[activeConversationId!]?.hasMore ?? false;

  // tìm convo đang đc mở
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId,
  );

  // ref --> tham chiếu đến (div) --> tạo div rổng cuối trang, tham chiếu ref đến đó,
  // sau đó làm sự kiện màn hình ở tin nhắn mới nhất khi chọn 1 convo bất kỳ
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lastMessage = selectedConvo?.lastMessage;
    if (!lastMessage) {
      return;
    }
    const seenBy = selectedConvo?.seenBy ?? [];
    // nếu đã có người đọc
    setLastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");
  }, [selectedConvo]);

  // kéo xuống dưới khi load convo --> dùng uselayout (chức năng gần như tương tụ useefect nhưng chạy sớm hơn - trc khi trình diệt vẽ layout )
  // --> giao diện sẽ hiện ở cột mốc lúc người dùng nhìn thấy
  useLayoutEffect(() => {
    if (!messagesEndRef.current) {
      return;
    }
    // nếu có giá trị (tức là convo đc chọn) --> croll xuống div
    messagesEndRef.current.scrollIntoView({
      // behavior: "smooth", // cuộn mược hơn
      block: "end",
    });
  }, [activeConversationId]);

  const fetchMoreMessages = async () => {
    if (!activeConversationId) {
      return;
    }
    try {
      await fetchMessages(activeConversationId);
    } catch (error) {
      console.error("Lỗi xãy ra khi setch thêm tin");
    }
  };

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
      <div
        id="scrollableDiv"
        className="flex flex-col-reverse overflow-y-auto overflow-x-hidden beautiful-scrollbar"
      >
        {/* như một cột móc, ko hiển thị gì, đã đảo ngược thứ tự với infinitescroll */}
        <div ref={messagesEndRef}></div>
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchMoreMessages}
          hasMore={hasMore}
          scrollableTarget="scrollableDiv"
          loader={<p>Đang tải ...</p>}
          inverse={true} // kích hoạt khi kéo lên
          style={{
            display: "flex",
            flexDirection: "column-reverse", // đảo chiều
            overflow: "visible",
          }}
        >
          {/* {messages.map((message, index) => ( */}
          {reversedMessages.map((message, index) => (
            <MessageItem
              key={message._id ?? index}
              message={message}
              index={index}
              // messages={messages}
              messages={reversedMessages}
              selectedConvo={selectedConvo}
              lastMessageStatus={lastMessageStatus}
            />
          ))}
        </InfiniteScroll>
        {/* như một cột móc, ko hiển thị gì */}
        {/* <div ref={messagesEndRef}></div> */}
      </div>
    </div>
  );
};

export default ChatWindowBody;

// beautiful-scrollbar: tự custom thanh cuộn đẹp hơn
