import { useEffect, useState, type FormEvent } from "react";
import { useFriendStore } from "@/stores/useFriendStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import type { Friend } from "@/types/user";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { Label } from "../ui/label";
// import InviteSuggestionList from "../newGroupChat/InviteSuggestionList";
// import SelectedUsersList from "../newGroupChat/SelectedUsersList";
import FriendInvitePicker from "../newGroupChat/FriendInvitePicker";

interface AddGroupMembersModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  conversation: Conversation;
}

const AddGroupMembersModal = ({
  open,
  setOpen,
  conversation,
}: AddGroupMembersModalProps) => {
  const { friends, getFriends, loading: friendsLoading } = useFriendStore();
  const { addGroupMembers, loading: chatLoading } = useChatStore();

  // const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Friend[]>([]);

  const existingMemberIds = conversation.participants.map(
    (participant) => participant._id,
  );

  useEffect(() => {
    if (!open) return;
    getFriends();
  }, [open]);

  useEffect(() => {
    if (!open) {
      // setSearch("");
      setSelectedUsers([]);
    }
  }, [open]);

  // const filteredFriends = friends.filter(
  //   (friend) =>
  //     !existingMemberIds.includes(friend._id) &&
  //     !selectedUsers.some((user) => user._id === friend._id) &&
  //     friend.displayName.toLowerCase().includes(search.toLowerCase()),
  // );

  const handleSelectFriend = (friend: Friend) => {
    setSelectedUsers((prev) => [...prev, friend]);
    // setSearch("");
  };

  const handleRemoveFriend = (friend: Friend) => {
    setSelectedUsers((prev) => prev.filter((user) => user._id !== friend._id));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      toast.warning("Bạn phải chọn ít nhất một thành viên để thêm");
      return;
    }

    try {
      await addGroupMembers(
        conversation._id,
        selectedUsers.map((user) => user._id),
      );
      toast.success("Đã mời thành viên vào nhóm");
      setOpen(false);
    } catch (error) {
      console.error("Lỗi thêm thành viên vào nhóm", error);
      toast.error("Thêm thành viên thất bại");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-106.25 border-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize">
            Thêm thành viên vào nhóm
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FriendInvitePicker
            label="Tìm bạn bè"
            friends={friends}
            selectedUsers={selectedUsers}
            excludeIds={existingMemberIds}
            onSelect={handleSelectFriend}
            onRemove={handleRemoveFriend}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={chatLoading || friendsLoading}
              className="flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth"
            >
              {chatLoading || friendsLoading
                ? "Đang xử lý ..."
                : "Thêm thành viên"}
            </Button>
          </DialogFooter>
        </form>
        {/* <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="invite" className="text-sm font-semibold">
              Tìm bạn bè
            </Label>
            <Input
              id="invite"
              placeholder="Tìm theo tên hiển thị ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass border-border/50 focus:border-primary/50 transition-smooth"
            />
          </div>

          {search && filteredFriends.length > 0 && (
            <InviteSuggestionList
              filteredFriends={filteredFriends}
              onSelect={handleSelectFriend}
            />
          )}

          <SelectedUsersList
            invitedUsers={selectedUsers}
            onRemove={handleRemoveFriend}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={chatLoading || friendsLoading}
              className="flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth"
            >
              {chatLoading || friendsLoading
                ? "Đang xử lý ..."
                : "Thêm thành viên"}
            </Button>
          </DialogFooter>
        </form> */}
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupMembersModal;
