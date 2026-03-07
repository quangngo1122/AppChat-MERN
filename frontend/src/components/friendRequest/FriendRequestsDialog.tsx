import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFriendStore } from "@/stores/useFriendStore";
import SentRequests from "./SentRequests";
import ReceivedRequests from "./ReceivedRequests";

interface FriendRequestsDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const FriendRequestsDialog = ({ open, setOpen }: FriendRequestsDialogProps) => {
  const [tab, setTab] = useState("received"); // xem tác nào đang đc chọn trong dialog danh sách đã nhận hay đã gửi
  const { getAllFriendRequests } = useFriendStore();

  // vừa mở dialog --> load toàn bộ lời mời kết bạn
  useEffect(() => {
    const loadRequest = async () => {
      try {
        await getAllFriendRequests(); // fetch cả 2 danh sách đã nnhan và đã gửi
      } catch (error) {
        console.error("Lỗi xãy ra khi load requests", error);
      }
    };
    loadRequest();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Lời mời kết bạn</DialogTitle>
        </DialogHeader>
        <Tabs
          value={tab}
          onValueChange={setTab} // ui sẽ cập nhật ngay lập tức
          className="w-full"
        >
          {/* 2 cột đã nhận và đã gửi */}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">Đã nhận</TabsTrigger>
            <TabsTrigger value="sent">Đã gửi</TabsTrigger>
          </TabsList>
          <TabsContent value="received">
            {/* --- component list received --- */}
            <ReceivedRequests />
          </TabsContent>
          <TabsContent value="sent">
            {/* --- component list sent --- */}
            <SentRequests />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FriendRequestsDialog;
