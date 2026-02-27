import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Separator } from "../ui/separator";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import GroupChatAvatar from "./GroupChatAvatar";

const ChatWindowHeader = ({ chat }: { chat?: Conversation }) => {
  const { conversations, activeConversationId } = useChatStore();

  const { user } = useAuthStore();

  let otherUser;

  // xem props chat đc truyền vào chưa, chưa thì tim2 xem có cuộc trò truyện nào trùng với activeC ko
  chat = chat ?? conversations.find((c) => c._id === activeConversationId);

  // nếu chat chưa có dữ liệu gì thì chỉ cần hiện nút mở sidebar, khỏi cần nội dung
  if (!chat) {
    return (
      <header
        className="md:hidden sticky top-0 z-10 flex 
    items-center gap-2 px-4 py-2 w-full"
      >
        <SidebarTrigger className="-ml-1 text-foreground" />
      </header>
    );
  }
  // kiểm tra có phả chat riêng ko, phải thì lấy thông tin người còn lại để hiển thị (vd:avt)
  if (chat.type === "direct") {
    const otherUsers = chat.participants.filter((p) => p._id != user?._id); // khác id mình
    otherUser = otherUsers.length > 0 ? otherUsers[0] : null; // có thì lấy đầu tiên
    if (!user || !otherUser) return; // ko có thì thôi
  }

  return (
    <header className="sticky top-0 z-10 px-4 py-2 flex items-center bg-background">
      <div className="flex items-center gap-2 w-full">
        <SidebarTrigger className="-ml-1 text-foreground" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <div className="p-2 w-full flex items-center gap-3">
          {/* avartar */}
          <div className="relative">
            {chat.type === "direct" ? (
              <>
                <UserAvatar
                  type={"sidebar"}
                  name={otherUser?.displayName || "QApp"}
                  avatarUrl={otherUser?.avatarUrl || undefined}
                />
                {/* note: nào kết nối socket io thì sửa lại status theo đó */}
                <StatusBadge status="offline" />
              </>
            ) : (
              <GroupChatAvatar
                participants={chat.participants}
                type="sidebar"
              />
            )}
          </div>

          {/* name */}
          <h2 className="font-semibold text-foreground">
            {chat.type === "direct" ? otherUser?.displayName : chat.group?.name}
          </h2>
        </div>
      </div>
    </header>
  );
};

export default ChatWindowHeader;

// data-[orientation=vertical]:h-4 --> lhi separator ở trạng thái vertical đang nằm dọc thì đật chiều cao là 16 px
