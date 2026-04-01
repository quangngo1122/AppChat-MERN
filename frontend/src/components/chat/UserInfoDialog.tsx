import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Participant } from "@/types/chat";
import type { User } from "@/types/user";
import { userService } from "@/services/userService";
import UserAvatar from "./UserAvatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";

interface UserInfoDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  participant: Participant | null;
}

const UserInfoDialog = ({
  open,
  setOpen,
  participant,
}: UserInfoDialogProps) => {
  const [userInfo, setUserInfo] = useState<User | null>(null);

  useEffect(() => {
    if (!open || !participant) {
      setUserInfo(null);
      return;
    }

    const loadUser = async () => {
      try {
        const user = await userService.getUserById(participant._id);
        setUserInfo(user);
      } catch {
        setUserInfo(null);
      }
    };

    loadUser();
  }, [open, participant]);

  if (!participant) return null;

  const displayUser = userInfo ?? {
    _id: participant._id,
    username: "",
    displayName: participant.displayName,
    email: "",
    phone: "",
    bio: "",
    avatarUrl: participant.avatarUrl ?? undefined,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-y-auto p-0 bg-transparent border-0 shadow-2xl sm:max-w-3xl">
        <div className="bg-gradient-glass">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <DialogHeader className="mb-3">
              <DialogTitle className="text-2xl font-bold text-foreground">
                Thông tin người dùng
              </DialogTitle>
            </DialogHeader>
            <Card className="glass-strong border-border/30">
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left sm:items-start">
                  <UserAvatar
                    type="profile"
                    name={displayUser.displayName}
                    avatarUrl={displayUser.avatarUrl ?? undefined}
                    className="ring-4 ring-white shadow-lg"
                  />
                  <div className="space-y-2 sm:flex-1">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">
                        {displayUser.displayName}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Thành viên chat
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-muted p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Email
                        </p>
                        <p className="mt-1 break-all text-sm font-medium text-foreground">
                          {displayUser.email || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Số điện thoại
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {displayUser.phone || "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Giới thiệu
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {displayUser.bio || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserInfoDialog;

// import type { Dispatch, SetStateAction } from "react";
// import type { Participant } from "@/types/chat";
// import UserAvatar from "./UserAvatar";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
// import { Card, CardContent } from "../ui/card";

// interface UserInfoDialogProps {
//   open: boolean;
//   setOpen: Dispatch<SetStateAction<boolean>>;
//   participant: Participant | null;
// }

// const formatJoinedAt = (joinedAt: string) => {
//   if (!joinedAt) return "-";
//   return new Date(joinedAt).toLocaleDateString("vi-VN", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });
// };

// const UserInfoDialog = ({
//   open,
//   setOpen,
//   participant,
// }: UserInfoDialogProps) => {
//   if (!participant) return null;

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogContent className="overflow-y-auto p-0 bg-transparent border-0 shadow-2xl sm:max-w-lg">
//         <div className="bg-gradient-glass">
//           <div className="max-w-4xl mx-auto px-4 py-4">
//             <DialogHeader className="mb-3">
//               <DialogTitle className="text-2xl font-bold text-foreground">
//                 Thông tin người dùng
//               </DialogTitle>
//             </DialogHeader>
//             <Card className="glass-strong border-border/30">
//               <CardContent className="space-y-6">
//                 <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left sm:items-start">
//                   <UserAvatar
//                     type="profile"
//                     name={participant.displayName}
//                     avatarUrl={participant.avatarUrl ?? undefined}
//                     className="ring-4 ring-white shadow-lg"
//                   />
//                   <div className="space-y-2 sm:flex-1">
//                     <div>
//                       <h2 className="text-2xl font-semibold text-foreground">
//                         {participant.displayName}
//                       </h2>
//                       <p className="text-sm text-muted-foreground">
//                         Thành viên chat
//                       </p>
//                     </div>
//                     <div className="grid gap-3 sm:grid-cols-2">
//                       <div className="rounded-xl bg-muted p-4">
//                         <p className="text-xs uppercase tracking-wide text-muted-foreground">
//                           Mã người dùng
//                         </p>
//                         <p className="mt-1 break-all text-sm font-medium text-foreground">
//                           {participant._id}
//                         </p>
//                       </div>
//                       <div className="rounded-xl bg-muted p-4">
//                         <p className="text-xs uppercase tracking-wide text-muted-foreground">
//                           Tham gia
//                         </p>
//                         <p className="mt-1 text-sm font-medium text-foreground">
//                           {formatJoinedAt(participant.joinedAt)}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default UserInfoDialog;
