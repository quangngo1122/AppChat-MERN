import { useFriendStore } from "@/stores/useFriendStore";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { UserPlus, Users } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { Friend } from "@/types/user";
// import InviteSuggestionList from "../newGroupChat/InviteSuggestionList";
// import SelectedUsersList from "../newGroupChat/SelectedUsersList";
import FriendInvitePicker from "../newGroupChat/FriendInvitePicker";
import { toast } from "sonner";
import { useChatStore } from "@/stores/useChatStore";

const NewGroupChatModal = () => {
  const [groupName, setGroupName] = useState(""); // tên nhóm
  // const [search, setSearch] = useState(""); // lưu giá trị ô tìm kiếm bạn bè

  const { friends, getFriends } = useFriendStore();

  const [invitedUsers, setInvitedUsers] = useState<Friend[]>([]);

  const { loading, createConversation } = useChatStore();

  const handleGetFriends = async () => {
    await getFriends();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault(); // chặn hành vi mặt định submit là refresh
      if (invitedUsers.length === 0) {
        toast.warning("Bạn phải mời ít nhất một thành viên vào nhóm");
        return;
      }

      // nếu hợp lệ thì --> tạo conversation group mới với các user đó
      await createConversation(
        "group",
        groupName,
        invitedUsers.map((u) => u._id), // id các thành viên
      );

      // reset dữ liệu đã chọn
      // setSearch("");
      setGroupName("");
      setInvitedUsers([]);
    } catch (error) {
      console.error(
        "Lỗi xãy ra khi handleSubmit trong newGroupChatModal",
        error,
      );
    }
  };

  // lọc những U có tên bắt đầu bằng từ khóa đang gõ
  // const filteredFriends = friends.filter(
  //   (friend) =>
  //     friend.displayName
  //       .toLocaleLowerCase()
  //       .includes(search.toLocaleLowerCase()) && // kiểm tra trong danh sách xem cái nào có chứa từ khóa đang search ko
  //     !invitedUsers.some((u) => u._id === friend._id), // và chỉ hiển thị các user chưa chọn trước đó thôi
  // );

  // thêm thứ đã chọn vào mảng user đc chọn
  const handleSelectFriend = (friend: Friend) => {
    // setInvitedUsers([...invitedUsers, friend]);
    // setSearch("");
    setInvitedUsers((prev) => [...prev, friend]);
  };

  // giữ lại tất cả id khác Id mình muốn xóa
  const handleRemoveFriend = (friend: Friend) => {
    // setInvitedUsers(invitedUsers.filter((u) => u._id !== friend._id));
    setInvitedUsers((prev) => prev.filter((u) => u._id !== friend._id));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          onClick={handleGetFriends}
          className="flex z-10 justify-center items-center size-5 rounded-full
           hover:bg-sidebar-accent transition cursor-pointer"
        >
          <Users className="size-4" />
          <span className="sr-only">Tạo nhóm</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 border-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize">tạo nhóm chat mới</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* tên nhóm */}
          <div className="space-y-2">
            <Label htmlFor="groupName" className="text-sm font-semibold">
              Tên nhóm
            </Label>
            <Input
              id="groupName"
              placeholder="Gõ tên nhóm vào đây ..."
              className="glass border-border/50 focus:border-primary/50 transition-smooth"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          {/* <div className="space-y-2 ">
            <Label htmlFor="invite" className="text-sm font-semibold">
              Mời thành viên
            </Label>
            <Input
              id="invite"
              placeholder="Tìm theo tên hiển thị ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            {search && filteredFriends.length > 0 && (
              <InviteSuggestionList
                filteredFriends={filteredFriends}
                onSelect={handleSelectFriend}
              />
            )}

            <SelectedUsersList
              invitedUsers={invitedUsers}
              onRemove={handleRemoveFriend}
            />
          </div> */}

          <FriendInvitePicker
            friends={friends}
            selectedUsers={invitedUsers}
            onSelect={handleSelectFriend}
            onRemove={handleRemoveFriend}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth"
            >
              {loading ? (
                <span>Đang tạo ...</span>
              ) : (
                <>
                  <UserPlus className="size-4 mr-2 " />
                  Tạo nhóm
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupChatModal;
