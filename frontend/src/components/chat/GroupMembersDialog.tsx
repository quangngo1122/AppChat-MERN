import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Conversation, Participant } from "@/types/chat";
import type { User } from "@/types/user";
import { userService } from "@/services/userService";
import UserAvatar from "./UserAvatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";

interface GroupMembersDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  conversation: Conversation;
}

const formatJoinedAt = (joinedAt: string) => {
  if (!joinedAt) return "-";
  return new Date(joinedAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const GroupMembersDialog = ({
  open,
  setOpen,
  conversation,
}: GroupMembersDialogProps) => {
  const [selectedMember, setSelectedMember] = useState<Participant | null>(
    null,
  );
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);

  useEffect(() => {
    setSelectedMember(conversation.participants[0] ?? null);
  }, [conversation.participants]);

  useEffect(() => {
    if (!open || !selectedMember) {
      setSelectedProfile(null);
      return;
    }

    const loadProfile = async () => {
      try {
        const user = await userService.getUserById(selectedMember._id);
        setSelectedProfile(user);
      } catch {
        setSelectedProfile(null);
      }
    };

    loadProfile();
  }, [open, selectedMember]);

  if (!conversation) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-y-auto p-0 bg-transparent border-0 shadow-2xl sm:max-w-6xl">
        <div className="bg-gradient-glass">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <DialogHeader className="mb-3">
              <DialogTitle className="text-2xl font-bold text-foreground">
                Thành viên nhóm
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
              <Card className="glass-strong border-border/30">
                <CardHeader>
                  <CardTitle>Danh sách thành viên</CardTitle>
                </CardHeader>
                <CardContent
                  className={cn(
                    "space-y-2",
                    conversation.participants.length > 3 &&
                      "max-h-51 overflow-y-auto",
                  )}
                >
                  {conversation.participants.map((member) => {
                    const isSelected = selectedMember?._id === member._id;
                    return (
                      <button
                        key={member._id}
                        type="button"
                        onClick={() => setSelectedMember(member)}
                        className={cn(
                          "w-full rounded-2xl border p-3 text-left transition hover:border-primary/50 hover:bg-primary/5",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border/50 bg-surface",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            type="chat"
                            name={member.displayName}
                            avatarUrl={member.avatarUrl ?? undefined}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {member.displayName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Tham gia {formatJoinedAt(member.joinedAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="glass-strong border-border/30">
                <CardHeader>
                  <CardTitle>Thông tin chi tiết</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMember ? (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left sm:items-start">
                        <UserAvatar
                          type="profile"
                          name={selectedMember.displayName}
                          avatarUrl={selectedMember.avatarUrl ?? undefined}
                          className="ring-4 ring-white shadow-lg"
                        />
                        <div className="space-y-2 sm:flex-1">
                          <div>
                            <h2 className="text-2xl font-semibold text-foreground">
                              {selectedMember.displayName}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              Thành viên nhóm
                            </p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl bg-muted p-4">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Email
                              </p>
                              <p className="mt-1 break-all text-sm font-medium text-foreground">
                                {selectedProfile?.email || "Chưa cập nhật"}
                              </p>
                            </div>
                            <div className="rounded-xl bg-muted p-4">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Số điện thoại
                              </p>
                              <p className="mt-1 text-sm font-medium text-foreground">
                                {selectedProfile?.phone || "Chưa cập nhật"}
                              </p>
                            </div>
                          </div>
                          <div className="rounded-xl bg-muted p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Giới thiệu
                            </p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                              {selectedProfile?.bio || "Chưa cập nhật"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Không có thành viên để hiển thị.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupMembersDialog;
