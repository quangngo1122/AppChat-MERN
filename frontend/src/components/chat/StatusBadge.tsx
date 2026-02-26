// chấm tròn xanh hoặc xám khi người dùng app online hoặc app

import { cn } from "@/lib/utils";

const StatusBadge = ({ status }: { status: "online" | "offline" }) => {
  return (
    <div
      className={cn(
        "absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-card",
        status === "online" && "status-online",
        status === "offline" && "status-offline",
      )}
    ></div>
  );
};

export default StatusBadge;

// -bottom-0.5 -right-0.5: dịch nhẹ dưới lên bên phải so với điểm nó đang đứng
