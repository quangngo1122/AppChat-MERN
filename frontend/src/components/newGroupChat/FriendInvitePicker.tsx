import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Friend } from "@/types/user";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import InviteSuggestionList from "./InviteSuggestionList";
import SelectedUsersList from "./SelectedUsersList";
import { cn } from "@/lib/utils";

interface FriendInvitePickerProps {
  label?: string;
  friends: Friend[];
  selectedUsers: Friend[];

  excludeIds?: string[];
  onSelect: (friend: Friend) => void;
  onRemove: (friend: Friend) => void;
}

const FriendInvitePicker = ({
  label = "Mời thành viên",
  friends,
  selectedUsers,
  excludeIds = [],
  onSelect,
  onRemove,
}: FriendInvitePickerProps) => {
  const [search, setSearch] = useState("");
  const [listOpen, setListOpen] = useState(false);

  const availableFriends = friends.filter(
    (friend) =>
      !excludeIds.includes(friend._id) &&
      !selectedUsers.some((user) => user._id === friend._id),
  );

  const filteredFriends = availableFriends.filter((friend) =>
    friend.displayName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (friend: Friend) => {
    onSelect(friend);
    setSearch("");
  };

  const showSearchSuggestions = Boolean(search) && !listOpen;
  const friendsToShow = listOpen ? availableFriends : filteredFriends;

  return (
    <div className="space-y-2">
      <Label htmlFor="invite" className="text-sm font-semibold">
        {label}
      </Label>

      <div className="flex gap-2">
        <Input
          id="invite"
          placeholder="Tìm theo tên hiển thị ..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (e.target.value) setListOpen(false);
          }}
          className="glass border-border/50 focus:border-primary/50 transition-smooth"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setListOpen((open) => !open)}
          className="shrink-0 gap-1 border-border/50"
          aria-expanded={listOpen}
          aria-label="Chọn bạn bè từ danh sách"
        >
          Chọn
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              listOpen && "rotate-180",
            )}
          />
        </Button>
      </div>

      {(listOpen || showSearchSuggestions) && (
        <>
          {friendsToShow.length > 0 ? (
            <InviteSuggestionList
              filteredFriends={friendsToShow}
              onSelect={handleSelect}
            />
          ) : (
            <p className="text-sm text-muted-foreground py-2 text-center border rounded-lg">
              {availableFriends.length === 0
                ? "Không còn bạn bè nào để thêm"
                : "Không tìm thấy bạn bè phù hợp"}
            </p>
          )}
        </>
      )}

      <SelectedUsersList invitedUsers={selectedUsers} onRemove={onRemove} />
    </div>
  );
};

export default FriendInvitePicker;
