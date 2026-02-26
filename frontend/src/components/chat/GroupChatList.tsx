// danh sach cac nhom chat

import { useChatStore } from "@/stores/useChatStore";
import GroupChatCard from "./GroupChatCard";

const GroupChatList = () => {
  const { conversations } = useChatStore();

  if (!conversations) {
    return;
  }

  const groupchats = conversations.filter((convo) => convo.type === "group");

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {groupchats.map((convo) => (
        <GroupChatCard key={convo._id} convo={convo} />
      ))}
    </div>
  );
};

export default GroupChatList;
