import Logout from "@/components/auth/Logout";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
// import React from "react";

const ChatAppPage = () => {
  // const {user} = useAuthStore(); // cú pháp này có 1 bất lợi là nó theo dõi tất cả state trong useAuthStore, nên 1 trong đó thay đổi là component đều bị rerender
  const user = useAuthStore((s) => s.user); // chỉ lấy và theo dõi state user lưu trong store thôi

  const handleOnClick = async () => {
    try {
      await api.get("/users/test", { withCredentials: true });
      toast.success("ok");
    } catch (error) {
      console.error(error);
      toast.error("that bai");
    }
  };
  return (
    <div>
      {user?.username}
      <Logout />
      <Button onClick={handleOnClick}>test</Button>
    </div>
  );
};

export default ChatAppPage;
