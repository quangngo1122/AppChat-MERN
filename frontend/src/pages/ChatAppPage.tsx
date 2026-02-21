import Logout from "@/components/auth/logout";
import { useAuthStore } from "@/stores/useAuthStore";
// import React from "react";

const ChatAppPage = () => {
  // const {user} = useAuthStore(); // cú pháp này có 1 bất lợi là nó theo dõi tất cả state trong useAuthStore, nên 1 trong đó thay đổi là component đều bị rerender
  const user = useAuthStore((s) => s.user); // chỉ lấy và theo dõi state user lưu trong store thôi
  return (
    <div>
      {user?.username}
      <Logout />
    </div>
  );
};

export default ChatAppPage;
