import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface IUserAvatarProps {
  type: "sidebar" | "chat" | "profile"; // kích thước hình
  name: string;
  avatarUrl?: string;
  className?: string;
}

const UserAvatar = ({ type, name, avatarUrl, className }: IUserAvatarProps) => {
  // nếu ko có avt
  const bgColor = !avatarUrl ? "bg-blue-500" : "";
  // ko có name thì gán giá trị mặt định
  if (!name) {
    name = "Quang";
  }

  return (
    <Avatar
      className={cn(
        className ?? "",
        type === "sidebar" && "size-12 text-base",
        type === "chat" && "size-8 text-sm",
        type === "profile" && "size-24 text-3xl shadow-md",
      )}
    >
      <AvatarImage src={avatarUrl} alt={name} />
      {/* Nếu ảnh lỗi / không có --> hiển thị AvatarFallback --> hiển thị chữ cái đầu, trong avt bg xanh */}
      <AvatarFallback className={`${bgColor} text-white font-semibold`}>
        {name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
