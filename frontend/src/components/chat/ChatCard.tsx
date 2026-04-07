import { MoreHorizontal, Trash2 } from "lucide-react";
import { Card } from "../ui/card";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

// format định dạng hiển thị time
import { formatOnlineTime, cn } from "@/lib/utils";

interface ChatCardProps {
  convoId: string;
  name: string;
  timestamp?: Date;
  isActive: boolean; // xem hộp chat này có đc chọn ko
  onSelect: (id: string) => void;
  unreadCount?: number; // số tin chưa đọc
  leftSection: React.ReactNode; // avt
  subtitle: React.ReactNode; // review tin nhắn cuối
  menuItems?: React.ReactNode;
  onDelete?: (id: string) => void; // hàm gọi khi nhấn xóa
}

const ChatCard = ({
  convoId,
  name,
  timestamp,
  isActive,
  onSelect,
  unreadCount,
  leftSection,
  subtitle,
  menuItems,
  onDelete,
}: ChatCardProps) => {
  return (
    <Card
      key={convoId}
      className={cn(
        "group border-none p-3 cursor-pointer transition-smooth glass hover:bg-muted/30",
        isActive &&
          "ring-2 ring-primary/50 bg-linear-to-tr from-primary-glow/10 to-primary-foreground",
      )}
      onClick={() => onSelect(convoId)} // click vào gọi onselect cập nhật card nào đang đc chọn (active)
    >
      <div className="flex items-center gap-3">
        <div className="relative">{leftSection}</div> {/* avt */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={cn(
                "font-semibold text-sm truncate",
                unreadCount && unreadCount > 0 && "text-foreground",
              )}
            >
              {name}
            </h3>
            <span className="text-xs text-muted-foreground">
              {timestamp ? formatOnlineTime(timestamp) : ""}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {subtitle}
            </div>
            {onDelete || menuItems ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="size-4 text-muted-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:size-5 transition-smooth"
                  >
                    <MoreHorizontal />
                    <span className="sr-only">Options</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" className="w-auto">
                  {menuItems}
                  {onDelete && (
                    <DropdownMenuItem onClick={() => onDelete(convoId)}>
                      <Trash2 className="text-muted-foreground mr-2" />
                      <span>Xóa cuộc trò chuyện</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <MoreHorizontal className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 hover:size-5 transition-smooth" />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatCard;

// *** note tailwind
// flex-1: chiếm toàn bộ ko gian còn lại
// text-muted-foreground: màu mờ
// group-hover: sửa style phần tử con khi hover vào phần tử cha
