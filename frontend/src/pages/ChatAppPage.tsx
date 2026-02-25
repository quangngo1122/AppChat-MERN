// import React from "react";

import ChatWindowLayout from "@/components/chat/ChatWindowLayout";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const ChatAppPage = () => {
  // // const {user} = useAuthStore(); // cú pháp này có 1 bất lợi là nó theo dõi tất cả state trong useAuthStore, nên 1 trong đó thay đổi là component đều bị rerender
  // const user = useAuthStore((s) => s.user); // chỉ lấy và theo dõi state user lưu trong store thôi

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex h-screen w-full p-2">
        <ChatWindowLayout />
      </div>
    </SidebarProvider>
  );
};
export default ChatAppPage;
