import type { Dispatch, SetStateAction } from "react";

import ProfileCard from "./ProfileCard";
import { useAuthStore } from "@/stores/useAuthStore";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import PersonalInfoForm from "./PersonalInfoForm";
import PreferencesForm from "./PreferencesForm";
import PrivacySettings from "./PrivacySettings";

interface ProfileDialogProps {
  open: boolean;

  setOpen: Dispatch<SetStateAction<boolean>>;
}

const ProfileDialog = ({ open, setOpen }: ProfileDialogProps) => {
  const { user } = useAuthStore();
  return (
    <Dialog
      open={open} // để biết khi nào hiển thị
      onOpenChange={setOpen} // tự động truyền false cho setopen khi bấm ra ngoài hay đóng X dialog
    >
      <DialogContent className="overflow-y-auto p-0 bg-transparent border-0 shadow-2xl">
        <div className="bg-gradient-glass">
          <div className="max-w-4xl mx-auto px-4 py-2 ">
            {/* hoading --> tiêu đề h1 */}
            <DialogHeader className="mb-3">
              <DialogTitle className="text-2xl font-bold text-foreground">
                Profile & Setting
              </DialogTitle>
            </DialogHeader>
            {/* avt, tóm tắt người dùng */}
            <ProfileCard user={user} />
            {/* tabs */}
            <Tabs defaultValue="personal" className="my-4">
              <TabsList className="grid w-full grid-cols-3 glass-light">
                <TabsTrigger
                  value="personal"
                  className="data-[state=active]:glass-strong"
                >
                  Tài Khoản
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="data-[state=active]:glass-strong"
                >
                  Cấu Hình
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="data-[state=active]:glass-strong"
                >
                  Bảo Mật
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <PersonalInfoForm userInfo={user} />
              </TabsContent>

              <TabsContent value="preferences">
                <PreferencesForm />
              </TabsContent>

              <TabsContent value="privacy">
                <PrivacySettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
