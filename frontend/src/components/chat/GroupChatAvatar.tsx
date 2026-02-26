import type { Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Ellipsis } from "lucide-react";

interface GroupChatAvatarProps {
  participants: Participant[];
  type: "chat" | "sidebar";
}

const GroupChatAvatar = ({ participants, type }: GroupChatAvatarProps) => {
  const avatars = [];
  // xác định số avt hiển thị
  const limit = Math.min(participants.length, 4); // nhiều nhất 4, ít hơn thì lấy hết,  nhiều hơn 4 thì lấy 4 người đầu tiên

  for (let i = 0; i < limit; i++) {
    const member = participants[i];
    avatars.push(
      <UserAvatar
        key={i}
        type={type} // lấy 4 avt đầu từ danh sách participants
        name={member.displayName}
        avatarUrl={member.avatarUrl ?? undefined}
      />,
    );
  }
  return (
    <div
      className="relative flex -space-x-2 *:data-[slot=avatar]:ring-background 
    *:data-[slot=avatar]:ring-2"
    >
      {avatars}
      {/* nếu nhiều hơn 4 avt thì hiện thêm dấu ... */}
      {
        <div
          className="flex items-center z-10 justify-center size-8 
        rounded-full bg-muted ring-2 ring-background text-muted-foreground"
        >
          <Ellipsis className="size-4" />
        </div>
      }
    </div>
  );
};

export default GroupChatAvatar;

// -space-x-2: để các phần tử gần nhau hơn, tạo cảm giác chồng lên nhau
// *:data-[slot=avatar]: áp dụng cho phần tử có: data-slot="avatar", áp dụng cho tất cả phần tử con trực tiếp
