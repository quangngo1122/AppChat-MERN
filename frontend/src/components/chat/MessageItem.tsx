// GD Tin nhắn

import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface MessageItemProps {
  message: Message; // một tin nhắn cụ thể
  index: number;
  messages: Message[]; // all tn trong 1 convo
  selectedConvo: Conversation;
  lastMessageStatus: "delivered" | "seen";
}

const MessageItem = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
}: MessageItemProps) => {
  // const prev = messages[index - 1];
  const prev = index + 1 < messages.length ? messages[index + 1] : undefined;

  const isShowTime =
    index === 0 || // tin nhắn đầu
    new Date(message?.createdAt).getTime() -
      new Date(prev?.createdAt || 0).getTime() >
      300000; // 2 tin cách nhau trên 5 phút

  // ktra xem có tách nhóm tn ko, vd 2 tin nhắn cùng là 1 ngừi gửi thì chỉ hiện 1 avt,
  // trong time ko quá dài thì hiện time gửi dưới tn mới nhất thôi
  const isGroupBreak =
    isShowTime || // tin nhắn đầu
    message.senderId !== prev?.senderId; // tin nhắn khác người gửi

  // lấy thông tin người gửi hiện tại hiển thị tên và avt
  const participant = selectedConvo.participants.find(
    (p: Participant) => p._id.toString() === message.senderId.toString(),
  );

  return (
    <>
      {/* timestamp */}
      {isShowTime && (
        <span className="flex text-xs justify-center text-muted-foreground px-1">
          {formatMessageTime(new Date(message.createdAt))}
        </span>
      )}

      <div
        className={cn(
          "flex gap-2 message-bounce mt-1",
          message.isOwn ? "justify-end" : "justify-start",
        )}
      >
        {/* avt --> hiện của người khác thôi*/}
        {!message.isOwn && (
          <div className="w-8">
            {isGroupBreak && (
              <UserAvatar
                type="chat"
                name={participant?.displayName ?? "QChat"}
                avatarUrl={participant?.avatarUrl ?? undefined}
              />
            )}
          </div>
        )}
        {/* tin nhắn */}
        <div
          className={cn(
            "max-w-xs lg:max-w-md space-y-1 flex flex-col",
            message.isOwn ? "items-end" : "items-start",
          )}
        >
          <Card
            className={cn(
              "p-3",
              message.isOwn
                ? "chat-bubble-sent border-0"
                : "chat-bubble-received",
            )}
          >
            <p className="text-sm leading-relaxed wrap-break-word">
              {message.content}
            </p>
          </Card>

          {/* seen - delivered */}
          {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-1.5 py-0.5 h-4 border-0",
                lastMessageStatus === "seen"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {lastMessageStatus}
            </Badge>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageItem;

//  message-bounce --> giúp tin nhắn có animation lước vào
// leading-relaxed wrap-break-word --> cho chữ dể đọc, từ quá dài thì xuống dòng
