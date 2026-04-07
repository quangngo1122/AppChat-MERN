import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useState } from "react";
import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import UnreadCountBadge from "./UnreadCountBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import AddGroupMembersModal from "./AddGroupMembersModal";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { toast } from "sonner";

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
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

  const unreadCount = convo.unreadCounts[user._id];
  const name = convo.group?.name ?? "";
  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    // only fetch when we don't already have messages for this conversation
    if (!messages[id]) {
      // gọi api fetch messages
      await fetchMessages();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa cuộc trò chuyện này?")) {
      return;
    }

    try {
      await useChatStore.getState().deleteConversation(convo._id);
      toast.success("Đã xóa cuộc trò chuyện");
    } catch (error) {
      console.error("Lỗi xóa convo", error);
      toast.error("Xóa cuộc trò chuyện thất bại");
    }
  };

  const [openAddMembers, setOpenAddMembers] = useState(false);

  return (
    <>
      <ChatCard
        convoId={convo._id}
        name={name}
        timestamp={
          convo.lastMessage?.createdAt
            ? new Date(convo.lastMessage?.createdAt)
            : undefined
        }
        isActive={activeConversationId === convo._id} // ktra xem có đang mở convo này ko
        onSelect={handleSelectConversation}
        onDelete={handleDelete}
        menuItems={
          <DropdownMenuItem
            onClick={() => {
              setOpenAddMembers(true);
            }}
          >
            <span>Thêm thành viên</span>
          </DropdownMenuItem>
        }
        unreadCount={unreadCount}
        leftSection={
          <>
            {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
            <GroupChatAvatar participants={convo.participants} type="chat" />
          </>
        }
        subtitle={
          <p className="text-sm truncate text-muted-foreground">
            {convo.participants.length} thành viên
          </p>
        }
      />
      <AddGroupMembersModal
        open={openAddMembers}
        setOpen={setOpenAddMembers}
        conversation={convo}
      />
    </>
  );
};

export default GroupChatCard;

// truncate: tự ... khi quá dài
